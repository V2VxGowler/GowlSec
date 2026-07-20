import prisma from "../utils/prisma.js";
import crypto from "crypto";
import { sendVerificationEmail } from "../services/emailService.js";


export async function resendVerification(req, res) {
    try {

        const { email } = req.body;


        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email requis."
            });
        }


        const normalizedEmail = email.toLowerCase().trim();


        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail
            }
        });


        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur introuvable."
            });
        }


        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email déjà vérifié."
            });
        }

        const now = new Date();

if (
    user.lastVerificationEmailSent &&
    now - user.lastVerificationEmailSent < 2 * 60 * 1000
) {
    return res.status(429).json({
        success: false,
        message: "Veuillez attendre avant de renvoyer un email."
    });
}


        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");


        const verificationTokenExpires = new Date();

        verificationTokenExpires.setHours(
            verificationTokenExpires.getHours() + 24
        );


        await prisma.user.update({
    where: {
        id: user.id
    },
    data: {
        verificationToken,
        verificationTokenExpires,
        lastVerificationEmailSent: new Date()
    }
});


        await sendVerificationEmail(
            user.email,
            verificationToken
        );


        return res.json({
            success: true,
            message: "Email de vérification renvoyé."
        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}