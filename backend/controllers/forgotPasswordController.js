import prisma from "../utils/prisma.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/emailService.js";

export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email requis."
            });
        }

        // Recherche de l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Réponse identique que l'utilisateur existe ou non (sécurité)
        if (!user) {
            return res.json({
                success: true,
                message: "Si cet email est associé à un compte, un lien de réinitialisation a été envoyé."
            });
        }

        // Génération du token de réinitialisation
        const resetToken = crypto
            .randomBytes(32)
            .toString("hex");

        const resetTokenExpires = new Date();
        resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

        // Sauvegarde du token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordTokenExpires: resetTokenExpires
            }
        });

        // Envoi de l'email via Resend
        await sendPasswordResetEmail(user.email, resetToken);

        return res.json({
            success: true,
            message: "Si cet email est associé à un compte, un lien de réinitialisation a été envoyé."
        });

    } catch (error) {
        console.error("Erreur forgotPassword :", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur."
        });
    }
}