import prisma from "../utils/prisma.js";
import { DUMMY_PASSWORD_HASH } from "../utils/security.js";
import bcrypt from "bcrypt";
import { z } from "zod";
import {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken
} from "../utils/jwt.js";

import crypto from "crypto";
import { sendVerificationEmail } from "../services/emailService.js";

const registerSchema = z.object({
    username: z.string().min(3).max(30),

    email: z.string()
        .email()
        .refine((email) => {
            const domain = email.split("@")[1].toLowerCase();

            const allowedDomains = [
                "gmail.com",
                "outlook.com",
                "hotmail.com",
                "live.com",
                "proton.me",
                "protonmail.com",
                "icloud.com",
                "yahoo.com"
            ];

            return allowedDomains.includes(domain);
        }, {
            message: "Email Invalide !"
        }),

    password: z.string().min(8)
});

export async function register(req, res) {
    try {
        const data = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { username: data.username }
                ]
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Utilisateur déjà existant"
            });
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);

        // Création du token de vérification email
        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");

        const verificationTokenExpires = new Date();

verificationTokenExpires.setHours(
    verificationTokenExpires.getHours() + 24
);


        const user = await prisma.user.create({
    data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,

        verificationToken,
        verificationTokenExpires,
        emailVerified: false
    }
});

        // Envoi de l'email Resend
        await sendVerificationEmail(
            user.email,
            verificationToken
        );


        return res.status(201).json({
            success: true,
            message: "Compte créé. Vérifie ton email.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });


    } catch (error) {

    if (error instanceof z.ZodError) {
        return res.status(400).json({
            success: false,
            message: "Email invalide."
        });
    }

    return res.status(500).json({
        success: false,
        message: "Erreur serveur."
    });
}
}
 export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis."
      });
    }
    

    const user = await prisma.user.findUnique({
    where: {
        email
    }
});

if (!user) {

    await bcrypt.compare(
        password,
        DUMMY_PASSWORD_HASH
    );

    return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect."
    });
}


const passwordValid = await bcrypt.compare(
    password,
    user.password
);

if (!passwordValid) {
    return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect."
    });
}

if (!user.emailVerified) {
    return res.status(403).json({
        success: false,
        message: "Veuillez vérifier votre email avant de vous connecter."
    });
}


// seulement ici tu génères les tokens
const accessToken = generateAccessToken(user);

// Refresh Token
const refreshTokenValue = generateRefreshToken();

// Hash avant stockage
const hashedRefreshToken = hashRefreshToken(refreshTokenValue);

// Expiration dans 7 jours
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7);

// Sauvegarde en base
await prisma.refreshToken.create({
    data: {
        tokenHash: hashedRefreshToken,
        expiresAt,
        userId: user.id
    }
});

// Cookie sécurisé
res.cookie("refreshToken", refreshTokenValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
});

// Réponse
return res.json({
  success: true,
  message: "Connexion réussie.",
  accessToken,
  user: {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  }
});

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function refreshToken(req, res) {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Refresh token manquant."
            });
        }

        const tokenHash = hashRefreshToken(token);

        const storedToken = await prisma.refreshToken.findUnique({
    where: {
        tokenHash
    },
    include: {
        user: true
    }
});

if (!storedToken) {
    return res.status(401).json({
        success: false,
        message: "Refresh token invalide."
    });
}

if (storedToken.revoked) {

    await prisma.refreshToken.updateMany({
        where: {
            userId: storedToken.userId
        },
        data: {
            revoked: true
        }
    });

    res.clearCookie("refreshToken");

    return res.status(401).json({
        success: false,
        message: "Réutilisation d'un ancien refresh token détectée."
    });
}

        if (storedToken.expiresAt < new Date()) {

    await prisma.refreshToken.update({
        where: {
            id: storedToken.id
        },
        data: {
            revoked: true
        }
    });

    return res.status(401).json({
        success: false,
        message: "Refresh token expiré."
    });
}

        await prisma.refreshToken.update({
    where: {
        id: storedToken.id
    },
    data: {
        revoked: true
    }
});

        const newRefreshToken = generateRefreshToken();
        const newHash = hashRefreshToken(newRefreshToken);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const newTokenRecord = await prisma.refreshToken.create({
    data: {
        tokenHash: newHash,
        expiresAt,
        userId: storedToken.user.id
    }
});
await prisma.refreshToken.update({
    where: {
        id: storedToken.id
    },
    data: {
        replacedBy: newTokenRecord.id.toString()
    }
});

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const accessToken = generateAccessToken(storedToken.user);

        return res.json({
            success: true,
            accessToken
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Erreur serveur."
        });
    }
}

export async function logout(req, res) {
    try {
        const token = req.cookies.refreshToken;

        if (token) {
            const tokenHash = hashRefreshToken(token);

            await prisma.refreshToken.updateMany({
                where: {
                    tokenHash
                },
                data: {
                    revoked: true
                }
            });
        }

        res.clearCookie("refreshToken");

        return res.json({
            success: true,
            message: "Déconnexion réussie."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Erreur serveur."
        });
    }
}