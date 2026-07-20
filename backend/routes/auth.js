import express from "express";

import {
    register,
    login,
    logout,
    refreshToken
} from "../controllers/authController.js";

import { verifyEmail } from "../controllers/emailVerificationController.js";
import { resendVerification } from "../controllers/resendVerificationController.js";
import { forgotPassword } from "../controllers/forgotPasswordController.js";
import { resetPassword } from "../controllers/resetPasswordController.js";

import {
    loginLimiter,
    registerLimiter,
    forgotPasswordLimiter
} from "../middleware/rateLimiter.js";


const router = express.Router();


router.post(
    "/register",
    registerLimiter,
    register
);


router.post(
    "/login",
    loginLimiter,
    login
);


router.post(
    "/logout",
    logout
);


router.post(
    "/refresh",
    refreshToken
);


// Vérification email
router.get(
    "/verify-email",
    verifyEmail
);


router.post(
    "/resend-verification",
    forgotPasswordLimiter,
    resendVerification
);


router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    forgotPassword
);


router.post(
    "/reset-password",
    resetPassword
);


export default router;