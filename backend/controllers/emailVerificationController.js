import prisma from "../utils/prisma.js";

export async function verifyEmail(req, res) {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token manquant"
            });
        }


        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token
            }
        });


        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Token invalide."
            });
        }


        if (
            user.verificationTokenExpires &&
            user.verificationTokenExpires < new Date()
        ) {
            return res.status(400).json({
                success: false,
                message: "Lien de vérification expiré."
            });
        }


        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationTokenExpires: null
            }
        });


        return res.json({
            success: true,
            message: "Email vérifié avec succès"
        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}