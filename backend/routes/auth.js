import express from "express";
import {
    register,
    login,
    refreshToken,
    logout
} from "../controllers/authController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { loginLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../schemas/authSchema.js";

const router = express.Router();

// Test
router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API Auth opérationnelle"
    });
});

// Inscription
router.post(
    "/register",
    validate(registerSchema),
    register
);

// Connexion
router.post(
    "/login",
    loginLimiter,
    validate(loginSchema),
    login
);

// Refresh du token
router.post("/refresh", refreshToken);

// Déconnexion
router.post("/logout", logout);

// Profil utilisateur connecté
router.get("/me", authMiddleware, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

export default router;