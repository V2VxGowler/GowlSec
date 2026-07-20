import prisma from "../utils/prisma.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/passwordResetEmailService.js";


export async function forgotPassword(req, res) {

    try {

        const { email } = req.body;


        if (!email) {
            return res.status(400).json({
                success:false,
                message:"Email requis."
            });
        }


        const user = await prisma.user.findUnique({
            where:{
                email: email.toLowerCase().trim()
            }
        });


        // sécurité : ne pas révéler si l'utilisateur existe
        if (!user) {
            return res.json({
                success:true,
                message:"Si cet email existe, un lien a été envoyé."
            });
        }


        const token = crypto
            .randomBytes(32)
            .toString("hex");


        const expires = new Date();

        expires.setHours(
            expires.getHours() + 1
        );


        await prisma.user.update({

            where:{
                id:user.id
            },

            data:{
                resetPasswordToken: token,
                resetPasswordTokenExpires: expires
            }
        });


        await sendPasswordResetEmail(
            user.email,
            token
        );


        return res.json({
            success:true,
            message:"Si cet email existe, un lien a été envoyé."
        });



    } catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }
}