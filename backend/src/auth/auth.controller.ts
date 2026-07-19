// src/auth/auth.controller.ts — HTTP request handlers for auth endpoints

import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.validator";
import { registerUser, loginUser, googleAuthUser } from "./auth.service";

/**
 * POST /api/auth/register
 * Validates input → delegates to service → returns user data (sans password)
 */
export async function register(req: Request, res: Response) {
    try {
        // safeParse returns result instead of throwing
        const parsed = registerSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: parsed.error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                })),
            });
        }

        const user = await registerUser(parsed.data);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });
    } catch (error) {
        // Duplicate email
        if (error instanceof Error && error.message === "Email already registered") {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

/**
 * POST /api/auth/login
 * Validates input → delegates to service → returns JWT token
 */
export async function login(req: Request, res: Response) {
    try {
        const parsed = loginSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: parsed.error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                })),
            });
        }

        const { token } = await loginUser(parsed.data);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
        });
    } catch (error) {
        // Invalid credentials (wrong email or password)
        if (error instanceof Error && error.message === "Invalid email or password") {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

/**
 * POST /api/auth/google
 * Verifies Google credential → delegates to service → returns JWT token
 */
export async function googleAuth(req: Request, res: Response) {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Credential is required",
            });
        }

        const { token } = await googleAuthUser(credential);

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            token,
        });
    } catch (error) {
        console.error("Google auth error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid Google credential",
        });
    }
}