import { z } from "zod";
import prisma from "../lib/prisma.js";
import {
  deleteProfileImage,
  uploadProfileImage,
} from "../services/cloudinary.js";
import { getProfileBadgesAndPoints } from "../services/badge.service.js";

const avatarKeys = [
  "bird",
  "ghost",
  "skull",
  "bug",
  "cat",
  "cpu",
  "rabbit",
  "flame",
];

const bannerKeys = ["indigo", "crimson", "forest", "sunset", "night"];

const profileStatuses = ["available", "learning", "looking-team"];
const profileSpecialties = [
  "Web",
  "Réseau",
  "Linux",
  "Active Directory",
  "OSINT",
  "Forensics",
  "Crypto",
  "Pwn",
];
const badgeKeys = ["first-ctf", "mentor", "web-hacker", "network", "top-10"];

const TROPHY_POINTS = {
  facile: 10,
  moyen: 20,
  difficile: 35,
  insane: 50,
};

const formBoolean = (defaultValue) =>
  z.preprocess(
    (value) =>
      value === undefined ? defaultValue : value === true || value === "true",
    z.boolean(),
  );

const formStringArray = (allowed, max) =>
  z.preprocess(
    (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value !== "string" || value.trim() === "") return [];
      try {
        return JSON.parse(value);
      } catch {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    },
    z.array(z.enum(allowed)).max(max),
  );

const formFreeStringArray = (maxItems, maxLength) =>
  z.preprocess(
    (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value !== "string" || value.trim() === "") return [];
      try {
        return JSON.parse(value);
      } catch {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    },
    z
      .array(z.string().trim().min(2).max(maxLength))
      .max(maxItems)
      .transform((items) => [...new Set(items)]),
  );

const optionalBoolean = z
  .union([z.literal("true"), z.literal("false")])
  .optional()
  .transform((value) => value === "true");

const profileSchema = z.object({
  bio: z.string().trim().max(300).optional().default(""),
  github: z
    .string()
    .trim()
    .max(39)
    .regex(/^[A-Za-z0-9-]*$/, "Nom d’utilisateur GitHub invalide.")
    .optional()
    .default(""),
  twitter: z
    .string()
    .trim()
    .max(50)
    .regex(/^[A-Za-z0-9_]*$/, "Nom d’utilisateur X invalide.")
    .optional()
    .default(""),
  discord: z.string().trim().max(80).optional().default(""),
  hackTheBox: z.string().trim().max(80).optional().default(""),
  rootMe: z.string().trim().max(80).optional().default(""),
  tryHackMe: z.string().trim().max(80).optional().default(""),
  otherPlatformName: z.string().trim().max(60).optional().default(""),
  otherPlatformUrl: z
    .string()
    .trim()
    .max(300)
    .refine(
      (value) => value === "" || /^https?:\/\/[^\s]+$/i.test(value),
      "Le lien de la plateforme doit commencer par http:// ou https://.",
    )
    .optional()
    .default(""),
  certifications: formFreeStringArray(12, 80),
  avatarKey: z.enum(avatarKeys).optional().default("bird"),
  bannerKey: z.enum(bannerKeys).optional().default("indigo"),
  bannerColor: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^#[0-9A-Fa-f]{6}$/.test(value),
      "Couleur de bannière invalide.",
    )
    .optional()
    .default(""),
  profileStatus: z.enum(profileStatuses).optional().default("learning"),
  specialties: formStringArray(profileSpecialties, profileSpecialties.length),
  isProfilePublic: formBoolean(true),
  showAge: formBoolean(true),
  showSocials: formBoolean(true),
  showCertifications: formBoolean(true),
  age: z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined
        ? null
        : Number(value),
    z.number().int().min(13).max(100).nullable(),
  ),
  pinnedBadges: formStringArray(badgeKeys, 3),
  removeAvatar: optionalBoolean,
  removeBanner: optionalBoolean,
});

const privateProfileSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  createdAt: true,
  bio: true,
  github: true,
  twitter: true,
  discord: true,
  avatarKey: true,
  avatarImage: true,
  avatarPublicId: true,
  banner: true,
  bannerImage: true,
  bannerPublicId: true,
  bannerColor: true,
  currentStreak: true,
  longestStreak: true,
  lastActiveDate: true,
  profileStatus: true,
  specialties: true,
  isProfilePublic: true,
  showAge: true,
  showSocials: true,
  showCertifications: true,
  age: true,
  pinnedBadges: true,
  customRole: true,
  hackTheBox: true,
  rootMe: true,
  tryHackMe: true,
  otherPlatformName: true,
  otherPlatformUrl: true,
  certifications: true,
};

const publicProfileSelect = {
  id: true,
  username: true,
  role: true,
  createdAt: true,
  bio: true,
  github: true,
  twitter: true,
  discord: true,
  avatarKey: true,
  avatarImage: true,
  banner: true,
  bannerImage: true,
  bannerColor: true,
  currentStreak: true,
  longestStreak: true,
  lastActiveDate: true,
  profileStatus: true,
  specialties: true,
  isProfilePublic: true,
  showAge: true,
  showSocials: true,
  showCertifications: true,
  age: true,
  pinnedBadges: true,
  customRole: true,
  hackTheBox: true,
  rootMe: true,
  tryHackMe: true,
  otherPlatformName: true,
  otherPlatformUrl: true,
  certifications: true,
  trophies: { select: { difficulty: true } },
  _count: {
    select: { questions: true, answers: true, labsOwned: true },
  },
};

function calculateProfilePoints(user) {
  const trophyPoints = (user.trophies || []).reduce(
    (total, trophy) => total + (TROPHY_POINTS[trophy.difficulty] || 10),
    0,
  );
  return (
    trophyPoints +
    Number(user._count?.questions || 0) * 2 +
    Number(user._count?.answers || 0) * 3 +
    Number(user._count?.labsOwned || 0) * 5
  );
}

function formatProfile(user, extras = {}, includePrivate = false) {
  const profile = {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    joinedAt: user.createdAt,
    bio: user.bio,
    avatarKey: user.avatarKey,
    avatarImage: user.avatarImage || "",
    banner: user.banner,
    bannerImage: user.bannerImage || "",
    bannerColor: user.bannerColor,
    currentStreak: user.currentStreak || 0,
    longestStreak: user.longestStreak || 0,
    lastActiveDate: user.lastActiveDate,
    profileStatus: user.profileStatus || "learning",
    specialties: user.specialties || [],
    isProfilePublic: user.isProfilePublic !== false,
    showAge: user.showAge !== false,
    showSocials: user.showSocials !== false,
    showCertifications: user.showCertifications !== false,
    age: user.age,
    pinnedBadges: (user.pinnedBadges || []).slice(0, 3),
    customRole: user.customRole || "",
    points: extras.points ?? calculateProfilePoints(user),
    socials: {
      github: user.github,
      twitter: user.twitter,
      discord: user.discord,
    },
    platformAccounts: {
      hackTheBox: user.hackTheBox || "",
      rootMe: user.rootMe || "",
      tryHackMe: user.tryHackMe || "",
      otherName: user.otherPlatformName || "",
      otherUrl: user.otherPlatformUrl || "",
    },
    certifications: (user.certifications || []).slice(0, 12),
    ...extras,
  };

  if (includePrivate) profile.email = user.email;
  if (!includePrivate && user.isProfilePublic === false) {
    profile.bio = "";
    profile.specialties = [];
    profile.age = null;
    profile.socials = { github: "", twitter: "", discord: "" };
    profile.platformAccounts = {
      hackTheBox: "",
      rootMe: "",
      tryHackMe: "",
      otherName: "",
      otherUrl: "",
    };
    profile.certifications = [];
    profile.privateProfile = true;
  } else if (!includePrivate) {
    if (user.showAge === false) profile.age = null;
    if (user.showSocials === false)
      profile.socials = { github: "", twitter: "", discord: "" };
    if (user.showSocials === false)
      profile.platformAccounts = {
        hackTheBox: "",
        rootMe: "",
        tryHackMe: "",
        otherName: "",
        otherUrl: "",
      };
    if (user.showCertifications === false) profile.certifications = [];
  }
  return profile;
}

function getUserId(req) {
  const value = req.user?.id ?? req.user?.userId ?? req.user?.sub;
  const userId = Number(value);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

export const getMe = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur invalide.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: privateProfileSelect,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    const extras = await getProfileBadgesAndPoints(user.id);
    return res.json(formatProfile(user, extras, true));
  } catch (error) {
    console.error("Erreur récupération profil :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

export const updateMe = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur invalide.",
      });
    }

    const data = profileSchema.parse(req.body);
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: privateProfileSelect,
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    const avatarFile = req.files?.avatar?.[0];
    const bannerFile = req.files?.banner?.[0];
    const updateData = {
      bio: data.bio,
      github: data.github,
      twitter: data.twitter,
      discord: data.discord,
      hackTheBox: data.hackTheBox,
      rootMe: data.rootMe,
      tryHackMe: data.tryHackMe,
      otherPlatformName: data.otherPlatformName,
      otherPlatformUrl: data.otherPlatformUrl,
      certifications: data.certifications,
      avatarKey: data.avatarKey,
      banner: data.bannerKey,
      bannerColor: data.bannerColor,
      profileStatus: data.profileStatus,
      specialties: data.specialties,
      isProfilePublic: data.isProfilePublic,
      showAge: data.showAge,
      showSocials: data.showSocials,
      showCertifications: data.showCertifications,
      age: data.age,
      pinnedBadges: data.pinnedBadges,
    };

    if (avatarFile) {
      const uploadedAvatar = await uploadProfileImage(avatarFile.buffer, {
        publicId:
          currentUser.avatarPublicId ||
          `gowlsec/profiles/avatars/user-${userId}`,
        width: 512,
        height: 512,
      });

      updateData.avatarImage = uploadedAvatar.secure_url;
      updateData.avatarPublicId = uploadedAvatar.public_id;
    } else if (data.removeAvatar) {
      await deleteProfileImage(currentUser.avatarPublicId);
      updateData.avatarImage = null;
      updateData.avatarPublicId = null;
    }

    if (bannerFile) {
      const uploadedBanner = await uploadProfileImage(bannerFile.buffer, {
        publicId:
          currentUser.bannerPublicId ||
          `gowlsec/profiles/banners/user-${userId}`,
        width: 1600,
        height: 500,
      });

      updateData.bannerImage = uploadedBanner.secure_url;
      updateData.bannerPublicId = uploadedBanner.public_id;
    } else if (data.removeBanner) {
      await deleteProfileImage(currentUser.bannerPublicId);
      updateData.bannerImage = null;
      updateData.bannerPublicId = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: privateProfileSelect,
    });

    return res.json({
      success: true,
      message: "Profil mis à jour avec succès.",
      user: formatProfile(
        updatedUser,
        await getProfileBadgesAndPoints(userId),
        true,
      ),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message || "Données de profil invalides.",
      });
    }

    console.error("Erreur mise à jour profil :", error);

    return res.status(500).json({
      success: false,
      message: "Impossible de mettre à jour le profil.",
    });
  }
};

export const listPublicProfiles = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: publicProfileSelect,
    });

    const profiles = users.map((user) => formatProfile(user));

    return res.json({ success: true, profiles });
  } catch (error) {
    console.error("Erreur liste des profils publics :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible de charger les profils." });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const username = String(req.params.username || "").trim();
    const user = await prisma.user.findUnique({
      where: { username },
      select: publicProfileSelect,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Profil introuvable." });
    }

    const extras = await getProfileBadgesAndPoints(user.id);
    return res.json({ success: true, profile: formatProfile(user, extras) });
  } catch (error) {
    console.error("Erreur profil public :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible de charger ce profil." });
  }
};

function utcDayStart(value = new Date()) {
  const date = new Date(value);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export const recordDailyActivity = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Utilisateur invalide." });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: privateProfileSelect,
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur introuvable." });

    const today = utcDayStart();
    const lastDay = user.lastActiveDate
      ? utcDayStart(user.lastActiveDate)
      : null;
    const dayDifference = lastDay
      ? Math.round((today.getTime() - lastDay.getTime()) / 86400000)
      : null;

    let currentStreak = user.currentStreak || 0;
    if (dayDifference === null) currentStreak = 1;
    else if (dayDifference === 1) currentStreak += 1;
    else if (dayDifference > 1) currentStreak = 1;

    const updated =
      dayDifference === 0
        ? user
        : await prisma.user.update({
            where: { id: userId },
            data: {
              currentStreak,
              longestStreak: Math.max(user.longestStreak || 0, currentStreak),
              lastActiveDate: today,
            },
            select: privateProfileSelect,
          });

    const extras = await getProfileBadgesAndPoints(userId);
    return res.json({
      success: true,
      user: formatProfile(updated, extras, true),
    });
  } catch (error) {
    console.error("Erreur streak quotidienne :", error);
    return res.status(500).json({
      success: false,
      message: "Impossible de mettre à jour la streak.",
    });
  }
};
