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


const router = express.Router();


router.post(
    "/register",
    register
);


router.post(
    "/login",
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
    resendVerification
);

router.post(
    "/forgot-password",
    forgotPassword
);

router.post(
    "/reset-password",
    resetPassword
);


export default router;