import express from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

function getUserId(req) {
  const id = Number(req.user?.id ?? req.user?.userId ?? req.user?.sub);
  return Number.isInteger(id) && id > 0 ? id : null;
}

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = getUserId(req);
    if (!Number.isInteger(id) || id <= 0 || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Salon invalide." });
    }

    const [room, user] = await Promise.all([
      prisma.hubRoom.findUnique({
        where: { id },
        select: { id: true, key: true, ownerId: true },
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    ]);
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Salon introuvable." });
    if (room.ownerId !== userId && user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Tu ne peux pas supprimer ce salon.",
      });
    }

    await prisma.$transaction([
      prisma.hubMessage.deleteMany({ where: { room: room.key } }),
      prisma.hubRoom.delete({ where: { id: room.id } }),
    ]);
    return res.json({
      success: true,
      message: "Salon supprimé définitivement.",
    });
  } catch (error) {
    console.error("Erreur suppression salon :", error);
    return res
      .status(500)
      .json({ success: false, message: "Impossible de supprimer le salon." });
  }
});

export default router;
