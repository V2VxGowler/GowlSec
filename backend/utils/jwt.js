import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET manquant dans .env");
}

export function generateAccessToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );
}

export function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

export function generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
}

export function hashRefreshToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}