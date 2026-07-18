import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: "Trop de requêtes."
    }
});

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,

    standardHeaders: true,
    legacyHeaders: false,

    skipSuccessfulRequests: true,

    keyGenerator: (req) => {
        const email = req.body.email
            ? req.body.email.trim().toLowerCase()
            : "unknown";

        return `${ipKeyGenerator(req)}:${email}`;
    },

    message: {
        success: false,
        message: "Trop de tentatives de connexion."
    }
});