
// src/middleware/auth.middleware.ts
// Express middleware for JWT authentication and role-based authorization.

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId: string;
    email: string;
    role: "user" | "admin";
}

/**
 * authenticate — Verifies the JWT from the Authorization header.
 * On success: attaches decoded payload to req.user and calls next().
 * On failure: returns 401 Unauthorized.
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    // Check for Bearer token in Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            message: "Access denied. No token provided.",
        });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        // Attach user payload to the request for downstream handlers
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch {
        res.status(401).json({
            success: false,
            message: "Access denied. Invalid or expired token.",
        });
    }
}

/**
 * authorizeAdmin — Ensures the authenticated user has the admin role.
 * Must be used after authenticate middleware.
 * On success: calls next().
 * On failure: returns 403 Forbidden.
 */
export function authorizeAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.user || req.user.role !== "admin") {
        res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required.",
        });
        return;
    }

    next();
}
