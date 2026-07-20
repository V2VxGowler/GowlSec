import prisma from "../utils/prisma.js";
import bcrypt from "bcrypt";


export async function resetPassword(req, res) {

    try {

        const {
            token,
            password
        } = req.body;


        if (!token || !password) {
            return res.status(400).json({
                success:false,
                message:"Token et mot de passe requis."
            });
        }


        if (password.length < 8) {
            return res.status(400).json({
                success:false,
                message:"Mot de passe trop court."
            });
        }


        const user = await prisma.user.findFirst({
            where:{
                resetPasswordToken: token
            }
        });


        if (!user) {
            return res.status(400).json({
                success:false,
                message:"Token invalide."
            });
        }


        if (
            user.resetPasswordTokenExpires &&
            user.resetPasswordTokenExpires < new Date()
        ) {

            return res.status(400).json({
                success:false,
                message:"Lien expiré."
            });

        }


        const hashedPassword = await bcrypt.hash(
            password,
            12
        );


        await prisma.user.update({

            where:{
                id:user.id
            },

            data:{
                password: hashedPassword,

                resetPasswordToken:null,

                resetPasswordTokenExpires:null
            }

        });


        return res.json({
            success:true,
            message:"Mot de passe modifié avec succès."
        });


    } catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }
}