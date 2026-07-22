import { z } from "zod";
import prisma from "../lib/prisma.js";
import {
  deleteProfileImage,
  uploadProfileImage,
} from "../services/cloudinary.js";

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

const bannerKeys = [
  "indigo",
  "crimson",
  "forest",
  "sunset",
  "night",
];

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
  avatarKey: z.enum(avatarKeys).optional().default("bird"),
  bannerKey: z.enum(bannerKeys).optional().default("indigo"),
  bannerColor: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^#[0-9A-Fa-f]{6}$/.test(value),
      "Couleur de bannière invalide."
    )
    .optional()
    .default(""),
  removeAvatar: optionalBoolean,
  removeBanner: optionalBoolean,
});

const publicProfileSelect = {
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
};

function formatProfile(user) {
  return {
    id: user.id,
    email: user.email,
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
    socials: {
      github: user.github,
      twitter: user.twitter,
      discord: user.discord,
    },
  };
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
      select: publicProfileSelect,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    return res.json(formatProfile(user));
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
      select: publicProfileSelect,
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
      avatarKey: data.avatarKey,
      banner: data.bannerKey,
      bannerColor: data.bannerColor,
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
      select: publicProfileSelect,
    });

    return res.json({
      success: true,
      message: "Profil mis à jour avec succès.",
      user: formatProfile(updatedUser),
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
