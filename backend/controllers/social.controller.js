import { z } from "zod";
import prisma from "../lib/prisma.js";

const SKILLS = [
  "Web",
  "Réseau",
  "Linux",
  "Active Directory",
  "OSINT",
  "Forensics",
  "Crypto",
  "Pwn",
];
const CUSTOM_ROLES = ["", "Mentor", "Organisateur CTF", "Modérateur"];
const userSummary = {
  id: true,
  username: true,
  role: true,
  customRole: true,
  avatarKey: true,
  avatarImage: true,
  profileStatus: true,
};

function userId(req) {
  const id = Number(req.user?.id ?? req.user?.userId ?? req.user?.sub);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function idParam(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function failValidation(error, res) {
  if (!(error instanceof z.ZodError)) return false;
  res.status(400).json({
    success: false,
    message: error.issues[0]?.message || "Données invalides.",
  });
  return true;
}

async function notify(targetId, type, title, message, link = "") {
  return prisma.userNotification.create({
    data: { userId: targetId, type, title, message, link },
  });
}

const recommendationSchema = z.object({
  type: z.enum(["thanks", "skill"]).default("thanks"),
  skill: z.enum(SKILLS).or(z.literal("")).default(""),
  message: z.string().trim().min(2).max(500),
});

export async function listRecommendations(req, res) {
  try {
    const target = await prisma.user.findUnique({
      where: { username: String(req.params.username || "") },
      select: { id: true },
    });
    if (!target)
      return res
        .status(404)
        .json({ success: false, message: "Profil introuvable." });
    const recommendations = await prisma.profileRecommendation.findMany({
      where: { targetId: target.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { author: { select: userSummary } },
    });
    return res.json({ success: true, recommendations });
  } catch (error) {
    console.error("Erreur recommandations :", error);
    return res.status(500).json({
      success: false,
      message: "Impossible de charger les recommandations.",
    });
  }
}

export async function createRecommendation(req, res) {
  try {
    const authorId = userId(req);
    const data = recommendationSchema.parse(req.body);
    const target = await prisma.user.findUnique({
      where: { username: String(req.params.username || "") },
      select: { id: true, username: true },
    });
    if (!target)
      return res
        .status(404)
        .json({ success: false, message: "Profil introuvable." });
    if (target.id === authorId)
      return res.status(400).json({
        success: false,
        message: "Tu ne peux pas recommander ton propre profil.",
      });
    const recommendation = await prisma.profileRecommendation.create({
      data: { ...data, authorId, targetId: target.id },
      include: { author: { select: userSummary } },
    });
    await notify(
      target.id,
      "recommendation",
      "Nouvelle recommandation",
      `${recommendation.author.username} a laissé un avis sur ton profil.`,
      "/profil",
    );
    return res.status(201).json({ success: true, recommendation });
  } catch (error) {
    if (failValidation(error, res)) return;
    console.error("Erreur recommandation :", error);
    return res.status(500).json({
      success: false,
      message: "Impossible d’ajouter la recommandation.",
    });
  }
}

export async function listConversations(req, res) {
  try {
    const me = userId(req);
    const messages = await prisma.directMessage.findMany({
      where: { OR: [{ senderId: me }, { receiverId: me }] },
      orderBy: { createdAt: "desc" },
      take: 500,
      include: {
        sender: { select: userSummary },
        receiver: { select: userSummary },
      },
    });
    const seen = new Set();
    const conversations = [];
    for (const message of messages) {
      const member =
        message.senderId === me ? message.receiver : message.sender;
      if (seen.has(member.id)) continue;
      seen.add(member.id);
      conversations.push({
        member,
        lastMessage: message,
        unread: messages.filter(
          (item) =>
            item.senderId === member.id &&
            item.receiverId === me &&
            !item.readAt,
        ).length,
      });
    }
    return res.json({ success: true, conversations });
  } catch (error) {
    console.error("Erreur conversations :", error);
    return res.status(500).json({
      success: false,
      message: "Impossible de charger les conversations.",
    });
  }
}

export async function getConversation(req, res) {
  try {
    const me = userId(req);
    const other = await prisma.user.findUnique({
      where: { username: String(req.params.username || "") },
      select: userSummary,
    });
    if (!other)
      return res
        .status(404)
        .json({ success: false, message: "Membre introuvable." });
    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: me, receiverId: other.id },
          { senderId: other.id, receiverId: me },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 300,
      include: {
        sender: { select: userSummary },
        receiver: { select: userSummary },
      },
    });
    await prisma.directMessage.updateMany({
      where: { senderId: other.id, receiverId: me, readAt: null },
      data: { readAt: new Date() },
    });
    return res.json({ success: true, member: other, messages });
  } catch (error) {
    console.error("Erreur conversation :", error);
    return res.status(500).json({
      success: false,
      message: "Impossible de charger cette conversation.",
    });
  }
}

export async function sendDirectMessage(req, res) {
  try {
    const senderId = userId(req);
    const { content } = z
      .object({ content: z.string().trim().min(1).max(1000) })
      .parse(req.body);
    const receiver = await prisma.user.findUnique({
      where: { username: String(req.params.username || "") },
      select: userSummary,
    });
    if (!receiver)
      return res
        .status(404)
        .json({ success: false, message: "Membre introuvable." });
    if (receiver.id === senderId)
      return res
        .status(400)
        .json({ success: false, message: "Choisis un autre membre." });
    const message = await prisma.directMessage.create({
      data: { content, senderId, receiverId: receiver.id },
      include: {
        sender: { select: userSummary },
        receiver: { select: userSummary },
      },
    });
    await notify(
      receiver.id,
      "direct-message",
      "Nouveau message privé",
      `${message.sender.username} t’a envoyé un message.`,
      "/messages",
    );
    return res.status(201).json({ success: true, message });
  } catch (error) {
    if (failValidation(error, res)) return;
    console.error("Erreur message privé :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible d’envoyer le message." });
  }
}

export async function listInvitations(req, res) {
  try {
    const invitations = await prisma.teamInvitation.findMany({
      where: { recipientId: userId(req) },
      orderBy: { createdAt: "desc" },
      include: {
        team: { include: { members: true } },
        sender: { select: userSummary },
      },
    });
    return res.json({ success: true, invitations });
  } catch (error) {
    console.error("Erreur invitations :", error);
    return res.status(500).json({
      success: false,
      message: "Impossible de charger les invitations.",
    });
  }
}

export async function createInvitation(req, res) {
  try {
    const senderId = userId(req);
    const data = z
      .object({
        teamId: z.coerce.number().int().positive(),
        username: z.string().trim().min(1).max(80),
        message: z.string().trim().max(300).default(""),
      })
      .parse(req.body);
    const [team, recipient] = await Promise.all([
      prisma.team.findUnique({
        where: { id: data.teamId },
        include: { members: true },
      }),
      prisma.user.findUnique({
        where: { username: data.username },
        select: userSummary,
      }),
    ]);
    if (!team || team.ownerId !== senderId)
      return res.status(403).json({
        success: false,
        message: "Seul le propriétaire de la team peut inviter.",
      });
    if (!recipient)
      return res
        .status(404)
        .json({ success: false, message: "Membre introuvable." });
    if (
      team.ownerId === recipient.id ||
      team.members.some((member) => member.userId === recipient.id)
    )
      return res.status(409).json({
        success: false,
        message: "Ce membre appartient déjà à la team.",
      });
    const pending = await prisma.teamInvitation.findFirst({
      where: { teamId: team.id, recipientId: recipient.id, status: "pending" },
    });
    if (pending)
      return res.status(409).json({
        success: false,
        message: "Une invitation est déjà en attente.",
      });
    const invitation = await prisma.teamInvitation.create({
      data: {
        teamId: team.id,
        senderId,
        recipientId: recipient.id,
        message: data.message,
      },
      include: { team: true, sender: { select: userSummary } },
    });
    await notify(
      recipient.id,
      "team-invitation",
      "Invitation d’équipe",
      `${invitation.sender.username} t’invite dans ${invitation.team.name}.`,
      "/messages",
    );
    return res.status(201).json({ success: true, invitation });
  } catch (error) {
    if (failValidation(error, res)) return;
    console.error("Erreur invitation :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible d’envoyer l’invitation." });
  }
}

export async function answerInvitation(req, res) {
  try {
    const id = idParam(req.params.id);
    const { action } = z
      .object({ action: z.enum(["accept", "decline"]) })
      .parse(req.body);
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id },
      include: { team: { include: { members: true } } },
    });
    if (!invitation || invitation.recipientId !== userId(req))
      return res
        .status(404)
        .json({ success: false, message: "Invitation introuvable." });
    if (invitation.status !== "pending")
      return res.status(409).json({
        success: false,
        message: "Cette invitation a déjà été traitée.",
      });
    if (action === "decline") {
      const updated = await prisma.teamInvitation.update({
        where: { id },
        data: { status: "declined" },
      });
      return res.json({ success: true, invitation: updated });
    }
    if (invitation.team.members.length >= invitation.team.maxMembers)
      return res
        .status(409)
        .json({ success: false, message: "Cette team est complète." });
    const updated = await prisma.$transaction(async (tx) => {
      await tx.teamMember.upsert({
        where: {
          teamId_userId: {
            teamId: invitation.teamId,
            userId: invitation.recipientId,
          },
        },
        create: { teamId: invitation.teamId, userId: invitation.recipientId },
        update: {},
      });
      return tx.teamInvitation.update({
        where: { id },
        data: { status: "accepted" },
      });
    });
    return res.json({ success: true, invitation: updated });
  } catch (error) {
    if (failValidation(error, res)) return;
    console.error("Erreur réponse invitation :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible de traiter l’invitation." });
  }
}

function formatPoll(poll, viewerId = null) {
  const totalVotes = poll.votes.length;
  return {
    ...poll,
    totalVotes,
    votedOptionId:
      poll.votes.find((vote) => vote.userId === viewerId)?.optionId || null,
    options: poll.options.map((option) => ({
      ...option,
      votes: poll.votes.filter((vote) => vote.optionId === option.id).length,
    })),
    votes: undefined,
  };
}

export async function listPolls(req, res) {
  try {
    const viewerId = userId(req);
    const where = req.query.room ? { room: String(req.query.room) } : {};
    const polls = await prisma.hubPoll.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { author: { select: userSummary }, options: true, votes: true },
    });
    return res.json({
      success: true,
      polls: polls.map((poll) => formatPoll(poll, viewerId)),
    });
  } catch (error) {
    console.error("Erreur sondages :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible de charger les sondages." });
  }
}

export async function createPoll(req, res) {
  try {
    const data = z
      .object({
        question: z.string().trim().min(5).max(250),
        room: z
          .string()
          .trim()
          .regex(/^[a-z0-9-]{1,80}$/)
          .default("general"),
        options: z.array(z.string().trim().min(1).max(120)).min(2).max(6),
        endsAt: z.coerce.date().optional(),
      })
      .parse(req.body);
    const poll = await prisma.hubPoll.create({
      data: {
        question: data.question,
        room: data.room,
        endsAt: data.endsAt,
        authorId: userId(req),
        options: {
          create: [...new Set(data.options)].map((label) => ({ label })),
        },
      },
      include: { author: { select: userSummary }, options: true, votes: true },
    });
    return res
      .status(201)
      .json({ success: true, poll: formatPoll(poll, userId(req)) });
  } catch (error) {
    if (failValidation(error, res)) return;
    console.error("Erreur création sondage :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible de créer le sondage." });
  }
}

export async function votePoll(req, res) {
  try {
    const pollId = idParam(req.params.id);
    const { optionId } = z
      .object({ optionId: z.coerce.number().int().positive() })
      .parse(req.body);
    const poll = await prisma.hubPoll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });
    if (!poll || poll.closed || (poll.endsAt && poll.endsAt < new Date()))
      return res
        .status(409)
        .json({ success: false, message: "Ce sondage est fermé." });
    if (!poll.options.some((option) => option.id === optionId))
      return res
        .status(400)
        .json({ success: false, message: "Option invalide." });
    await prisma.hubPollVote.upsert({
      where: { pollId_userId: { pollId, userId: userId(req) } },
      create: { pollId, optionId, userId: userId(req) },
      update: { optionId },
    });
    const updated = await prisma.hubPoll.findUnique({
      where: { id: pollId },
      include: { author: { select: userSummary }, options: true, votes: true },
    });
    return res.json({ success: true, poll: formatPoll(updated, userId(req)) });
  } catch (error) {
    if (failValidation(error, res)) return;
    console.error("Erreur vote :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible d’enregistrer le vote." });
  }
}

export async function getWeeklyChallenge(req, res) {
  try {
    const challenge = await prisma.weeklyChallenge.findFirst({
      where: { active: true, endsAt: { gte: new Date() } },
      orderBy: { startsAt: "desc" },
      include: { author: { select: userSummary } },
    });
    return res.json({ success: true, challenge });
  } catch (error) {
    console.error("Erreur défi :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible de charger le défi." });
  }
}

export async function createWeeklyChallenge(req, res) {
  try {
    const data = z
      .object({
        title: z.string().trim().min(3).max(150),
        description: z.string().trim().min(10).max(1200),
        category: z.string().trim().min(2).max(50),
        difficulty: z.string().trim().min(2).max(30),
        link: z.string().trim().url().or(z.literal("")).default(""),
        startsAt: z.coerce.date().optional(),
        endsAt: z.coerce.date(),
      })
      .parse(req.body);
    await prisma.weeklyChallenge.updateMany({
      where: { active: true },
      data: { active: false },
    });
    const challenge = await prisma.weeklyChallenge.create({
      data: {
        ...data,
        startsAt: data.startsAt || new Date(),
        authorId: req.admin.id,
      },
      include: { author: { select: userSummary } },
    });
    return res.status(201).json({ success: true, challenge });
  } catch (error) {
    if (failValidation(error, res)) return;
    console.error("Erreur création défi :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible de publier le défi." });
  }
}

const finderSchema = z.object({
  age: z.coerce.number().int().min(13).max(100).nullable().optional(),
  experience: z.enum(["debutant", "intermediaire", "avance", "expert"]),
  bio: z.string().trim().min(10).max(600),
  specialties: z.array(z.enum(SKILLS)).max(8),
  lookingFor: z.array(z.enum(SKILLS)).min(1).max(8),
  availability: z.string().trim().max(120).default(""),
  contactPreference: z.enum(["message", "invitation"]).default("message"),
  active: z.boolean().default(true),
});

export async function listTeamFinder(req, res) {
  try {
    const profiles = await prisma.teamFinderProfile.findMany({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
      include: { user: { select: userSummary } },
    });
    return res.json({ success: true, profiles });
  } catch (error) {
    console.error("Erreur recherche équipe :", error);
    return res.status(500).json({
      success: false,
      message: "Impossible de charger les profils disponibles.",
    });
  }
}

export async function upsertTeamFinder(req, res) {
  try {
    const data = finderSchema.parse(req.body);
    const profile = await prisma.teamFinderProfile.upsert({
      where: { userId: userId(req) },
      create: { ...data, userId: userId(req) },
      update: data,
      include: { user: { select: userSummary } },
    });
    return res.json({ success: true, profile });
  } catch (error) {
    if (failValidation(error, res)) return;
    console.error("Erreur CV CTF :", error);
    return res.status(500).json({
      success: false,
      message: "Impossible d’enregistrer la recherche d’équipe.",
    });
  }
}

export async function createReport(req, res) {
  try {
    const data = z
      .object({
        targetType: z.enum(["message", "profile"]),
        targetId: z.string().trim().min(1).max(120),
        reason: z.string().trim().min(3).max(80),
        details: z.string().trim().max(600).default(""),
      })
      .parse(req.body);
    const report = await prisma.communityReport.create({
      data: { ...data, reporterId: userId(req) },
    });
    return res.status(201).json({
      success: true,
      report,
      message: "Signalement transmis à la modération.",
    });
  } catch (error) {
    if (failValidation(error, res)) return;
    console.error("Erreur signalement :", error);
    return res.status(500).json({
      success: false,
      message: "Impossible d’envoyer le signalement.",
    });
  }
}

export async function listReports(req, res) {
  try {
    const reports = await prisma.communityReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: userSummary },
        resolver: { select: userSummary },
      },
    });
    return res.json({ success: true, reports });
  } catch (error) {
    console.error("Erreur liste signalements :", error);
    return res.status(500).json({
      success: false,
      message: "Impossible de charger les signalements.",
    });
  }
}

export async function resolveReport(req, res) {
  try {
    const { status } = z
      .object({ status: z.enum(["resolved", "dismissed"]) })
      .parse(req.body);
    const report = await prisma.communityReport.update({
      where: { id: idParam(req.params.id) },
      data: { status, resolverId: req.admin.id },
    });
    return res.json({ success: true, report });
  } catch (error) {
    if (failValidation(error, res)) return;
    if (error?.code === "P2025")
      return res
        .status(404)
        .json({ success: false, message: "Signalement introuvable." });
    return res.status(500).json({
      success: false,
      message: "Impossible de traiter le signalement.",
    });
  }
}

export async function listTeamScores(req, res) {
  try {
    const teams = await prisma.team.findMany({
      include: {
        owner: { select: userSummary },
        members: { include: { user: { select: userSummary } } },
        scoreEntries: { orderBy: { createdAt: "desc" } },
      },
    });
    const scoreboard = teams
      .map((team) => ({
        id: team.id,
        name: team.name,
        logoType: team.logoType,
        logoValue: team.logoValue,
        owner: team.owner,
        members: team.members.map((member) => member.user),
        history: team.scoreEntries,
        participations: team.scoreEntries.length,
        podiums: team.scoreEntries.filter((entry) => entry.rank <= 3).length,
        wins: team.scoreEntries.filter((entry) => entry.rank === 1).length,
        points: team.scoreEntries.reduce((sum, entry) => sum + entry.points, 0),
        bestPlayers: [
          ...new Set(
            team.scoreEntries.map((entry) => entry.bestPlayer).filter(Boolean),
          ),
        ].slice(0, 5),
      }))
      .sort((a, b) => b.points - a.points || b.wins - a.wins);
    return res.json({ success: true, scoreboard });
  } catch (error) {
    console.error("Erreur score teams :", error);
    return res.status(500).json({
      success: false,
      message: "Impossible de charger le classement des teams.",
    });
  }
}

export async function createTeamScore(req, res) {
  try {
    const data = z
      .object({
        teamId: z.coerce.number().int().positive(),
        eventId: z.string().trim().min(1).max(120),
        eventTitle: z.string().trim().min(2).max(200),
        rank: z.coerce.number().int().positive(),
        points: z.coerce.number().int().min(0).max(100000).default(0),
        bestPlayer: z.string().trim().max(80).default(""),
        highlight: z.string().trim().max(500).default(""),
      })
      .parse(req.body);
    const entry = await prisma.teamScoreEntry.upsert({
      where: { teamId_eventId: { teamId: data.teamId, eventId: data.eventId } },
      create: { ...data, authorId: req.admin.id },
      update: { ...data, authorId: req.admin.id },
    });
    return res.status(201).json({ success: true, entry });
  } catch (error) {
    if (failValidation(error, res)) return;
    return res.status(500).json({
      success: false,
      message: "Impossible d’enregistrer ce résultat.",
    });
  }
}

export async function updateCustomRole(req, res) {
  try {
    const { customRole } = z
      .object({ customRole: z.enum(CUSTOM_ROLES) })
      .parse(req.body);
    const user = await prisma.user.update({
      where: { id: idParam(req.params.id) },
      data: { customRole },
      select: userSummary,
    });
    return res.json({ success: true, user });
  } catch (error) {
    if (failValidation(error, res)) return;
    if (error?.code === "P2025")
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur introuvable." });
    return res
      .status(500)
      .json({ success: false, message: "Impossible de modifier le rôle." });
  }
}

const CREATION_COOLDOWN_DURATIONS = {
  question: 30 * 60 * 1000,
  writeup: 30 * 60 * 1000,
  trophy: 3 * 60 * 60 * 1000,
  event: 24 * 60 * 60 * 1000,
};

export async function getProgressOverview(req, res) {
  try {
    const me = userId(req);
    const [
      user,
      questions,
      answers,
      hubMessages,
      teamsOwned,
      teamMemberships,
      labsOwned,
      labMemberships,
      labMessages,
      writeups,
      trophies,
      ctfRegistrations,
      directMessages,
      recommendationsWritten,
      recommendationsReceived,
      badges,
      teamFinderProfiles,
      cooldownRows,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: me },
        select: {
          bio: true,
          github: true,
          twitter: true,
          discord: true,
          specialties: true,
          currentStreak: true,
          longestStreak: true,
        },
      }),
      prisma.question.count({ where: { authorId: me } }),
      prisma.answer.count({ where: { authorId: me } }),
      prisma.hubMessage.count({ where: { userId: me } }),
      prisma.team.count({ where: { ownerId: me } }),
      prisma.teamMember.count({ where: { userId: me } }),
      prisma.lab.count({ where: { ownerId: me } }),
      prisma.labMember.count({ where: { userId: me } }),
      prisma.labMessage.count({ where: { authorId: me } }),
      prisma.writeup.count({ where: { authorId: me } }),
      prisma.trophy.count({ where: { authorId: me } }),
      prisma.ctfRegistration.count({ where: { userId: me } }),
      prisma.directMessage.count({ where: { senderId: me } }),
      prisma.profileRecommendation.count({ where: { authorId: me } }),
      prisma.profileRecommendation.count({ where: { targetId: me } }),
      prisma.userBadge.count({ where: { userId: me } }),
      prisma.teamFinderProfile.count({ where: { userId: me, active: true } }),
      prisma.creationCooldown.findMany({
        where: {
          userId: me,
          type: { in: Object.keys(CREATION_COOLDOWN_DURATIONS) },
        },
        select: { type: true, lastCreatedAt: true },
      }),
    ]);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur introuvable." });

    const hasSocial = Boolean(user.github || user.twitter || user.discord);
    const profileComplete =
      String(user.bio || "").trim().length >= 80 &&
      (user.specialties || []).length >= 3 &&
      hasSocial;
    const now = Date.now();
    const cooldowns = Object.fromEntries(
      Object.entries(CREATION_COOLDOWN_DURATIONS).map(([type, durationMs]) => {
        const row = cooldownRows.find((item) => item.type === type);
        const startedAt = row ? new Date(row.lastCreatedAt).getTime() : 0;
        const remainingMs = startedAt
          ? Math.max(0, startedAt + durationMs - now)
          : 0;
        return [
          type,
          {
            durationSeconds: Math.ceil(durationMs / 1000),
            remainingSeconds: Math.ceil(remainingMs / 1000),
            availableAt: remainingMs
              ? new Date(now + remainingMs).toISOString()
              : null,
          },
        ];
      }),
    );

    return res.json({
      success: true,
      metrics: {
        profileComplete: profileComplete ? 1 : 0,
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        questions,
        answers,
        hubMessages,
        teamsOwned,
        teamMemberships,
        teamParticipations: teamsOwned + teamMemberships,
        labsOwned,
        labMemberships,
        labParticipations: labsOwned + labMemberships,
        labMessages,
        writeups,
        trophies,
        ctfRegistrations,
        directMessages,
        recommendationsWritten,
        recommendationsReceived,
        badges,
        teamFinderProfile: teamFinderProfiles > 0 ? 1 : 0,
      },
      cooldowns,
    });
  } catch (error) {
    console.error("Erreur progression :", error);
    return res.status(500).json({
      success: false,
      message: "Impossible de charger la progression.",
    });
  }
}

export async function listNotifications(req, res) {
  try {
    const me = userId(req);
    const now = new Date();
    const reminderLimit = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const upcomingRegistrations = await prisma.ctfRegistration.findMany({
      where: {
        userId: me,
        startsAt: { gt: now, lte: reminderLimit },
      },
      select: { eventId: true, eventTitle: true, startsAt: true },
    });

    await Promise.all(
      upcomingRegistrations.map(async (registration) => {
        const link = `/ctf/${registration.eventId}`;
        const exists = await prisma.userNotification.findFirst({
          where: { userId: me, type: "ctf-reminder", link },
          select: { id: true },
        });
        if (exists) return;
        await notify(
          me,
          "ctf-reminder",
          "Un CTF approche",
          `${registration.eventTitle} commence dans moins de 24 heures.`,
          link,
        );
      }),
    );

    const notifications = await prisma.userNotification.findMany({
      where: { userId: me },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return res.json({ success: true, notifications });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Impossible de charger les notifications.",
    });
  }
}

export async function readNotifications(req, res) {
  try {
    await prisma.userNotification.updateMany({
      where: { userId: userId(req), readAt: null },
      data: { readAt: new Date() },
    });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Impossible de mettre à jour les notifications.",
    });
  }
}
