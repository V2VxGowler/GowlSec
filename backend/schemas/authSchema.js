import { z } from "zod";

export const registerSchema = z.object({
    username: z
        .string()
        .min(3)
        .max(30)
        .trim(),

    email: z
        .email()
        .trim()
        .toLowerCase(),

    password: z
        .string()
        .min(12)
        .max(128)
});
export const loginSchema = z.object({
    email: z
        .email()
        .trim()
        .toLowerCase(),

    password: z
        .string()
        .min(1)
});