import bcrypt from "bcrypt";
import { z } from "zod";
import prisma from "../utils/prisma.js";

const optionalText = (maximum) =>
  z.string().trim().max(maximum).optional().default("");

const getUserId = (req) => {
  const value =
    req.user?.id ??
    req.user?.userId ??
    req.user?.sub;

  const userId = Number(value);

  return Number.isInteger(userId) ? userId : null;
};

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || "salon";
}

async function createUniqueRoomKey(label) {
  const base = slugify(label);
  let key = base;
  let counter = 2;

  while (
    await prisma.hubRoom.findUnique({
      where: { key },
      select: { id: true },
    })
  ) {
    key = `${base}-${counter}`;
    counter += 1;
  }

  return key;
}

function formatQuestion(question) {
  return {
    id: question.id,
    author: question.author.username,
    title: question.title,
    body: question.body,
    type: question.type,
    views: question.views,
    resolved: question.resolved,
    createdAt: question.createdAt,
    answers: (question.answers || []).map((answer) => ({
      id: answer.id,
      author: answer.author.username,
      body: answer.body,
      createdAt: answer.createdAt,
    })),
  };
}

function formatRoom(room) {
  return {
    id: room.id,
    key: room.key,
    label: room.label,
    desc: room.description,
    icon: room.icon,
    isPublic: room.isPublic,
    owner: room.owner?.username || "system",
    bannedUsers: room.bannedUsers || [],
    createdAt: room.createdAt,
  };
}

function formatTeam(team) {
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    logoType: team.logoType,
    logoValue: team.logoValue,
    owner: team.owner.username,
    members: (team.members || []).map(
      (member) => member.user.username
    ),
    maxMembers: team.maxMembers,
    visibility: team.visibility,
    requiresPassword:
      team.visibility === "private",
    createdAt: team.createdAt,
  };
}

function formatLab(lab) {
  return {
    id: lab.id,
    title: lab.title,
    platform: lab.platform,
    description: lab.description,
    owner: lab.owner.username,
    members: (lab.members || []).map(
      (member) => member.user.username
    ),
    maxMembers: lab.maxMembers,
    visibility: lab.visibility,
    requiresPassword:
      lab.visibility === "private",
    createdAt: lab.createdAt,
  };
}

function formatWriteup(writeup) {
  return {
    id: writeup.id,
    author: writeup.author.username,
    platform: writeup.platform,
    title: writeup.title,
    difficulty: writeup.difficulty,
    summary: writeup.summary,
    content: writeup.content,
    link: writeup.link,
    createdAt: writeup.createdAt,
  };
}

function formatTrophy(trophy) {
  return {
    id: trophy.id,
    author: trophy.author.username,
    platform: trophy.platform,
    title: trophy.title,
    difficulty: trophy.difficulty,
    note: trophy.note,
    certification: trophy.certification,
    imageUrl: trophy.imageUrl,
    createdAt: trophy.createdAt,
  };
}

function formatEvent(event) {
  return {
    id: event.id,
    author: event.author.username,
    title: event.title,
    type: event.type,
    date: event.date,
    description: event.description,
    link: event.link,
    createdAt: event.createdAt,
  };
}

function handleError(error, res) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      message:
        error.issues?.[0]?.message ||
        "Données invalides.",
    });
  }

  if (error?.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Cet élément existe déjà.",
    });
  }

  if (error?.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Cet élément a déjà été supprimé.",
    });
  }

  console.error("Erreur communauté :", error);

  return res.status(500).json({
    success: false,
    message: "Erreur serveur.",
  });
}


export async function getCommunity(req, res) {
  try {
    const [
      questions,
      rooms,
      teams,
      labs,
      writeups,
      trophies,
      events,
    ] = await Promise.all([
      prisma.question.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { username: true },
          },
          answers: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: { username: true },
              },
            },
          },
        },
      }),

      prisma.hubRoom.findMany({
        orderBy: { createdAt: "asc" },
        include: {
          owner: {
            select: { username: true },
          },
        },
      }),

      prisma.team.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: { username: true },
          },
          members: {
            include: {
              user: {
                select: { username: true },
              },
            },
          },
          announcements: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: { username: true },
              },
            },
          },
        },
      }),

      prisma.lab.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: { username: true },
          },
          members: {
            include: {
              user: {
                select: { username: true },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: { username: true },
              },
            },
          },
        },
      }),

      prisma.writeup.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { username: true },
          },
        },
      }),

      prisma.trophy.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { username: true },
          },
        },
      }),

      prisma.event.findMany({
        orderBy: { date: "asc" },
        include: {
          author: {
            select: { username: true },
          },
        },
      }),
    ]);

    const teamAnnouncements = teams.flatMap((team) =>
      team.announcements.map((announcement) => ({
        id: announcement.id,
        teamId: team.id,
        author: announcement.author.username,
        text: announcement.text,
        createdAt: announcement.createdAt,
      }))
    );

    const labMessages = labs.flatMap((lab) =>
      lab.messages.map((message) => ({
        id: message.id,
        labId: lab.id,
        author: message.author.username,
        text: message.text,
        createdAt: message.createdAt,
      }))
    );

    return res.json({
      success: true,
      questions: questions.map(formatQuestion),
      rooms: rooms.map(formatRoom),
      teams: teams.map(formatTeam),
      teamAnnouncements,
      labs: labs.map(formatLab),
      labMessages,
      writeups: writeups.map(formatWriteup),
      trophies: trophies.map(formatTrophy),
      events: events.map(formatEvent),
    });
  } catch (error) {
    return handleError(error, res);
  }
}

const questionSchema = z.object({
  title: z.string().trim().min(3).max(150),
  body: z.string().trim().min(3).max(10000),
  type: z
    .enum([
      "urgent",
      "accompagnement",
      "blocage",
      "question",
    ])
    .default("question"),
});

export async function createQuestion(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur invalide.",
      });
    }

    const data = questionSchema.parse(req.body);

    const remainingCooldown = await getRemainingCooldown(
      "question",
      userId,
      30 * 60 * 1000
    );

    if (remainingCooldown > 0) {
      return sendCooldownError(
        res,
        remainingCooldown,
        "une nouvelle question"
      );
    }

    const question = await prisma.question.create({
      data: {
        ...data,
        authorId: userId,
      },
      include: {
        author: {
          select: { username: true },
        },
        answers: {
          include: {
            author: {
              select: { username: true },
            },
          },
        },
      },
    });

    await saveCooldown("question", userId);

    return res.status(201).json({
      success: true,
      question: formatQuestion(question),
    });
  } catch (error) {
    return handleError(error, res);
  }
}

const roomSchema = z.object({
  label: z.string().trim().min(2).max(80),
  description: optionalText(300),
  icon: z.string().trim().min(1).max(30).default("hash"),
  isPublic: z.boolean().default(true),
  password: z.string().max(100).optional().default(""),
});

export async function createRoom(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur invalide.",
      });
    }

    const data = roomSchema.parse(req.body);

    if (!data.isPublic && !data.password.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Un mot de passe est requis pour un salon privé.",
      });
    }

    const key = await createUniqueRoomKey(data.label);

    const passwordHash = data.isPublic
      ? null
      : await bcrypt.hash(data.password, 12);

    const room = await prisma.hubRoom.create({
      data: {
        key,
        label: data.label,
        description: data.description,
        icon: data.icon,
        isPublic: data.isPublic,
        passwordHash,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { username: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      room: formatRoom(room),
    });
  } catch (error) {
    return handleError(error, res);
  }
}

const teamSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: optionalText(500),
  logoType: z.enum(["emoji", "image"]).default("emoji"),
  logoValue: z.string().trim().min(1).max(1000),
  visibility: z
    .enum(["public", "private"])
    .default("public"),
  password: z.string().max(100).optional().default(""),
  maxMembers: z.number().int().min(2).max(20).default(8),
});

export async function createTeam(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur invalide.",
      });
    }

    const data = teamSchema.parse(req.body);

    if (
      data.visibility === "private" &&
      !data.password.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Un mot de passe est requis pour une équipe privée.",
      });
    }

    const passwordHash =
      data.visibility === "private"
        ? await bcrypt.hash(data.password, 12)
        : null;

    const team = await prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
        logoType: data.logoType,
        logoValue: data.logoValue,
        visibility: data.visibility,
        passwordHash,
        maxMembers: data.maxMembers,
        ownerId: userId,
        members: {
          create: {
            userId,
          },
        },
      },
      include: {
        owner: {
          select: { username: true },
        },
        members: {
          include: {
            user: {
              select: { username: true },
            },
          },
        },
        announcements: true,
      },
    });

    return res.status(201).json({
      success: true,
      team: formatTeam(team),
    });
  } catch (error) {
    return handleError(error, res);
  }
}

const labSchema = z.object({
  title: z.string().trim().min(2).max(120),
  platform: z.string().trim().min(1).max(50),
  description: optionalText(10000),
  visibility: z
    .enum(["public", "private"])
    .default("public"),
  password: z.string().max(100).optional().default(""),
  maxMembers: z.number().int().min(2).max(20).default(8),
});

export async function createLab(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur invalide.",
      });
    }

    const data = labSchema.parse(req.body);

    if (
      data.visibility === "private" &&
      !data.password.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Un mot de passe est requis pour un lab privé.",
      });
    }

    const passwordHash =
      data.visibility === "private"
        ? await bcrypt.hash(data.password, 12)
        : null;

    const lab = await prisma.lab.create({
      data: {
        title: data.title,
        platform: data.platform,
        description: data.description,
        visibility: data.visibility,
        passwordHash,
        maxMembers: data.maxMembers,
        ownerId: userId,
        members: {
          create: {
            userId,
          },
        },
      },
      include: {
        owner: {
          select: { username: true },
        },
        members: {
          include: {
            user: {
              select: { username: true },
            },
          },
        },
        messages: true,
      },
    });

    return res.status(201).json({
      success: true,
      lab: formatLab(lab),
    });
  } catch (error) {
    return handleError(error, res);
  }
}

const writeupSchema = z.object({
  platform: z.string().trim().min(1).max(50),
  title: z.string().trim().min(3).max(150),
  difficulty: z.string().trim().min(1).max(30),
  summary: optionalText(500),
  content: z.string().trim().min(10).max(50000),
  link: optionalText(500),
});

export async function createWriteup(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur invalide.",
      });
    }

    const data = writeupSchema.parse(req.body);

    const remainingCooldown = await getRemainingCooldown(
      "writeup",
      userId,
      30 * 60 * 1000
    );

    if (remainingCooldown > 0) {
      return sendCooldownError(
        res,
        remainingCooldown,
        "un nouveau write-up"
      );
    }

    const writeup = await prisma.writeup.create({
      data: {
        ...data,
        authorId: userId,
      },
      include: {
        author: {
          select: { username: true },
        },
      },
    });

    await saveCooldown("writeup", userId);

    return res.status(201).json({
      success: true,
      writeup: formatWriteup(writeup),
    });
  } catch (error) {
    return handleError(error, res);
  }
}

const trophySchema = z.object({
  platform: z.string().trim().min(1).max(50),
  title: z.string().trim().min(2).max(150),
  difficulty: z.string().trim().min(1).max(30),
  note: optionalText(500),
  certification: optionalText(150),
  imageUrl: optionalText(800000),
});

export async function createTrophy(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur invalide.",
      });
    }

    const data = trophySchema.parse(req.body);

    const remainingCooldown = await getRemainingCooldown(
      "trophy",
      userId,
      3 * 60 * 60 * 1000
    );

    if (remainingCooldown > 0) {
      return sendCooldownError(
        res,
        remainingCooldown,
        "un nouveau trophée"
      );
    }

    const trophy = await prisma.trophy.create({
      data: {
        ...data,
        authorId: userId,
      },
      include: {
        author: {
          select: { username: true },
        },
      },
    });

    await saveCooldown("trophy", userId);

    return res.status(201).json({
      success: true,
      trophy: formatTrophy(trophy),
    });
  } catch (error) {
    return handleError(error, res);
  }
}

const eventSchema = z.object({
  title: z.string().trim().min(2).max(150),
  type: z.string().trim().min(1).max(50),
  date: z.coerce.date(),
  description: optionalText(10000),
  link: optionalText(500),
});

export async function createEvent(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur invalide.",
      });
    }

    const data = eventSchema.parse(req.body);

    const remainingCooldown = await getRemainingCooldown(
      "event",
      userId,
      24 * 60 * 60 * 1000
    );

    if (remainingCooldown > 0) {
      return sendCooldownError(
        res,
        remainingCooldown,
        "un nouvel événement"
      );
    }

    const event = await prisma.event.create({
      data: {
        ...data,
        authorId: userId,
      },
      include: {
        author: {
          select: { username: true },
        },
      },
    });

    await saveCooldown("event", userId);

    return res.status(201).json({
      success: true,
      event: formatEvent(event),
    });
  } catch (error) {
    return handleError(error, res);
  }
}

async function deleteOwnedResource(
  req,
  res,
  modelName,
  ownerField
) {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    if (!userId || !Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Identifiant invalide.",
      });
    }

    const [resource, currentUser] = await Promise.all([
      prisma[modelName].findUnique({ where: { id } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      }),
    ]);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Élément introuvable.",
      });
    }

    const isOwner = resource[ownerField] === userId;
    const isAdmin = currentUser?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Tu n’as pas la permission de supprimer cet élément.",
      });
    }

    await prisma[modelName].delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Élément supprimé.",
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export function deleteQuestion(req, res) {
  return deleteOwnedResource(
    req,
    res,
    "question",
    "authorId"
  );
}

export function deleteTeam(req, res) {
  return deleteOwnedResource(
    req,
    res,
    "team",
    "ownerId"
  );
}

export function deleteLab(req, res) {
  return deleteOwnedResource(
    req,
    res,
    "lab",
    "ownerId"
  );
}

export function deleteWriteup(req, res) {
  return deleteOwnedResource(
    req,
    res,
    "writeup",
    "authorId"
  );
}

export function deleteTrophy(req, res) {
  return deleteOwnedResource(
    req,
    res,
    "trophy",
    "authorId"
  );
}

export function deleteEvent(req, res) {
  return deleteOwnedResource(
    req,
    res,
    "event",
    "authorId"
  );
}

export function deleteTeamAnnouncement(req, res) {
  return deleteOwnedResource(
    req,
    res,
    "teamAnnouncement",
    "authorId"
  );
}

export function deleteLabMessage(req, res) {
  return deleteOwnedResource(
    req,
    res,
    "labMessage",
    "authorId"
  );
}

export async function deleteRoom(req, res) {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    if (!userId || !Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Identifiant invalide.",
      });
    }

    const [room, currentUser] = await Promise.all([
      prisma.hubRoom.findUnique({ where: { id } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      }),
    ]);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Salon introuvable.",
      });
    }

    const isOwner = room.ownerId === userId;
    const isAdmin = currentUser?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Tu n’as pas la permission de supprimer ce salon.",
      });
    }

    await prisma.$transaction([
      prisma.hubMessage.deleteMany({
        where: {
          room: room.key,
        },
      }),
      prisma.hubRoom.delete({
        where: { id },
      }),
    ]);

    return res.json({
      success: true,
      message: "Salon supprimé.",
    });
  } catch (error) {
    return handleError(error, res);
  }
}
async function getRemainingCooldown(
  type,
  userId,
  durationMs
) {
  const cooldown = await prisma.creationCooldown.findUnique({
    where: {
      userId_type: {
        userId,
        type,
      },
    },
    select: {
      lastCreatedAt: true,
    },
  });

  if (!cooldown) {
    return 0;
  }

  const elapsed =
    Date.now() -
    new Date(cooldown.lastCreatedAt).getTime();

  return Math.max(0, durationMs - elapsed);
}

async function saveCooldown(type, userId) {
  const now = new Date();

  await prisma.creationCooldown.upsert({
    where: {
      userId_type: {
        userId,
        type,
      },
    },
    update: {
      lastCreatedAt: now,
    },
    create: {
      type,
      userId,
      lastCreatedAt: now,
    },
  });
}

function sendCooldownError(res, remainingMs, contentName) {
  const remainingMinutes = Math.ceil(
    remainingMs / 60000
  );

  const duration =
    remainingMinutes >= 60
      ? `${Math.ceil(remainingMinutes / 60)} heure(s)`
      : `${remainingMinutes} minute(s)`;

  return res.status(429).json({
    success: false,
    message:
      `Tu dois attendre encore ${duration} avant de publier ${contentName}.`,
    retryAfterSeconds: Math.ceil(remainingMs / 1000),
  });
}
