import prisma from "../lib/prisma.js";

export async function adminMiddleware(req, res, next) {
  try {
    const rawId = req.user?.id ?? req.user?.userId ?? req.user?.sub;
    const userId = Number(rawId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ success: false, message: "Authentification requise." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user || String(user.role || "").toLowerCase() !== "admin") {
      return res.status(403).json({ success: false, message: "Accès réservé aux administrateurs." });
    }

    req.admin = user;
    return next();
  } catch (error) {
    console.error("Erreur vérification administrateur :", error);
    return res.status(500).json({ success: false, message: "Impossible de vérifier les permissions." });
  }
}
