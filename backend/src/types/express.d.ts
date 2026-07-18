// src/types/express.d.ts
// Extends Express's Request interface to include the authenticated user payload
// attached by the authenticate middleware after JWT verification.

import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: "user" | "admin";
      };
    }
  }
}
