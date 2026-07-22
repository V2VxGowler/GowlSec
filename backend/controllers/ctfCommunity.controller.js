import { z } from "zod";
import prisma from "../lib/prisma.js";
import { getProfileBadgesAndPoints } from "../services/badge.service.js";

const participationSchema = z.object({
  eventTitle: z.string().trim().min(1).max(200),
  startsAt: z.string().datetime().nullable().optional(),
  teamId: z.number().int().positive().nullable().optional(),
  teamName: z.string().trim().min(1).max(80).default("Solo"),
});

const resultSchema = z.object({
  teamName: z.string().trim().min(1).max(80),
  rank: z.number().int().positive().max(100000),
  highlight: z.string().trim().max(500).default(""),
});

function getUserId(req) {
  const id = Number(req.user?.id ?? req.user?.userId ?? req.user?.sub);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function formatRegistration(registration) {
  return {
    id: registration.id,
    eventId: registration.eventId,
    eventTitle: registration.eventTitle,
    username: registration.user.username,
    team: registration.team?.name || registration.teamName || "Solo",
    teamId: registration.teamId,
    joinedAt: registration.createdAt,
  };
}

function formatResult(result) {
  return {
    id: result.id,
    eventId: result.eventId,
    team: result.teamName,
    teamName: result.teamName,
    rank: result.rank,
    highlight: result.highlight,
    createdAt: result.createdAt,
    author: result.author?.username,
  };
}

const registrationInclude = {
  user: {
    select: { id: true, username: true, avatarKey: true, avatarImage: true },
  },
  team: { select: { id: true, name: true } },
};

export async function getCtfCommunity(req, res) {
  try {
    const eventIds = String(req.query.eventIds || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 100);
    const where = eventIds.length ? { eventId: { in: eventIds } } : {};
    const [registrations, results] = await Promise.all([
      prisma.ctfRegistration.findMany({
        where,
        orderBy: { createdAt: "asc" },
        include: registrationInclude,
      }),
      prisma.ctfResult.findMany({
        where,
        orderBy: [{ eventId: "asc" }, { rank: "asc" }],
        include: { author: { select: { username: true } } },
      }),
    ]);
    return res.json({
      success: true,
      registrations: registrations.map(formatRegistration),
      results: results.map(formatResult),
    });
  } catch (error) {
    console.error("Erreur communauté CTF :", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Impossible de charger les participations CTF.",
      });
  }
}

export async function participateInCtf(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Connecte-toi pour participer." });
    const eventId = String(req.params.eventId || "")
      .trim()
      .slice(0, 120);
    if (!eventId)
      return res.status(400).json({ success: false, message: "CTF invalide." });
    const data = participationSchema.parse(req.body);

    if (data.teamId) {
      const team = await prisma.team.findFirst({
        where: {
          id: data.teamId,
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        select: { id: true },
      });
      if (!team)
        return res
          .status(403)
          .json({
            success: false,
            message: "Tu ne fais pas partie de cette équipe.",
          });
    }

    const registration = await prisma.ctfRegistration.upsert({
      where: { eventId_userId: { eventId, userId } },
      update: {
        eventTitle: data.eventTitle,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        teamId: data.teamId || null,
        teamName: data.teamName,
      },
      create: {
        eventId,
        eventTitle: data.eventTitle,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        teamId: data.teamId || null,
        teamName: data.teamName,
        userId,
      },
      include: registrationInclude,
    });

    const extras = await getProfileBadgesAndPoints(userId);
    return res.status(201).json({
      success: true,
      registration: formatRegistration(registration),
      user: { id: userId, ...extras },
    });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(400)
        .json({
          success: false,
          message: error.issues[0]?.message || "Inscription invalide.",
        });
    console.error("Erreur inscription CTF :", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Impossible d’enregistrer la participation.",
      });
  }
}

export async function leaveCtf(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Authentification requise." });
    const eventId = String(req.params.eventId || "").trim();
    await prisma.ctfRegistration.deleteMany({ where: { eventId, userId } });
    return res.json({ success: true, message: "Participation retirée." });
  } catch (error) {
    console.error("Erreur désinscription CTF :", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Impossible de retirer la participation.",
      });
  }
}

export async function createCtfResult(req, res) {
  try {
    const eventId = String(req.params.eventId || "")
      .trim()
      .slice(0, 120);
    const data = resultSchema.parse(req.body);
    const result = await prisma.ctfResult.upsert({
      where: { eventId_teamName: { eventId, teamName: data.teamName } },
      update: {
        rank: data.rank,
        highlight: data.highlight,
        authorId: req.admin.id,
      },
      create: {
        eventId,
        teamName: data.teamName,
        rank: data.rank,
        highlight: data.highlight,
        authorId: req.admin.id,
      },
      include: { author: { select: { username: true } } },
    });
    return res
      .status(201)
      .json({ success: true, result: formatResult(result) });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(400)
        .json({
          success: false,
          message: error.issues[0]?.message || "Résultat invalide.",
        });
    console.error("Erreur résultat CTF :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible de publier le résultat." });
  }
}

export async function deleteCtfResult(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res
        .status(400)
        .json({ success: false, message: "Résultat invalide." });
    await prisma.ctfResult.delete({ where: { id } });
    return res.json({ success: true, message: "Résultat supprimé." });
  } catch (error) {
    if (error?.code === "P2025")
      return res
        .status(404)
        .json({ success: false, message: "Résultat introuvable." });
    console.error("Erreur suppression résultat CTF :", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Impossible de supprimer le résultat.",
      });
  }
}
