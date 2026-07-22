import { z } from "zod";
import prisma from "../lib/prisma.js";

const announcementSchema = z.object({
  title: z.string().trim().min(3, "Le titre est trop court.").max(150),
  content: z.string().trim().min(5, "Le contenu est trop court.").max(2000),
  category: z
    .enum(["update", "announcement", "congrats"])
    .default("announcement"),
  link: z
    .string()
    .trim()
    .max(500)
    .refine(
      (value) => value === "" || /^https?:\/\//i.test(value),
      "Le lien doit commencer par http:// ou https://.",
    )
    .default(""),
});

function formatAnnouncement(announcement) {
  return {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    category: announcement.category,
    link: announcement.link,
    publishedAt: announcement.publishedAt,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
    author: announcement.author,
  };
}

const includeAuthor = {
  author: { select: { id: true, username: true, role: true } },
};

export async function listAnnouncements(req, res) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { publishedAt: "desc" },
      include: includeAuthor,
    });
    return res.json({
      success: true,
      announcements: announcements.map(formatAnnouncement),
    });
  } catch (error) {
    console.error("Erreur annonces :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible de charger les annonces." });
  }
}

export async function createAnnouncement(req, res) {
  try {
    const data = announcementSchema.parse(req.body);
    const announcement = await prisma.announcement.create({
      data: { ...data, authorId: req.admin.id },
      include: includeAuthor,
    });
    return res
      .status(201)
      .json({ success: true, announcement: formatAnnouncement(announcement) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({
          success: false,
          message: error.issues[0]?.message || "Annonce invalide.",
        });
    }
    console.error("Erreur création annonce :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible de publier l’annonce." });
  }
}

export async function updateAnnouncement(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res
        .status(400)
        .json({ success: false, message: "Annonce invalide." });
    const data = announcementSchema.partial().parse(req.body);
    const announcement = await prisma.announcement.update({
      where: { id },
      data,
      include: includeAuthor,
    });
    return res.json({
      success: true,
      announcement: formatAnnouncement(announcement),
    });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(400)
        .json({
          success: false,
          message: error.issues[0]?.message || "Annonce invalide.",
        });
    if (error?.code === "P2025")
      return res
        .status(404)
        .json({ success: false, message: "Annonce introuvable." });
    console.error("Erreur modification annonce :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible de modifier l’annonce." });
  }
}

export async function deleteAnnouncement(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res
        .status(400)
        .json({ success: false, message: "Annonce invalide." });
    await prisma.announcement.delete({ where: { id } });
    return res.json({ success: true, message: "Annonce supprimée." });
  } catch (error) {
    if (error?.code === "P2025")
      return res
        .status(404)
        .json({ success: false, message: "Annonce introuvable." });
    console.error("Erreur suppression annonce :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible de supprimer l’annonce." });
  }
}
