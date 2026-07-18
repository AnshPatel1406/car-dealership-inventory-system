// src/auth/auth.validator.ts — Zod schemas for validating input data at the API layer

import { z } from "zod";

// ─── Register Schema ───────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name cannot exceed 255 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email cannot exceed 255 characters")
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password cannot exceed 255 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

// ─── Login Schema ──────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email cannot exceed 255 characters")
    .toLowerCase(),

  // No strength requirements on login — avoids leaking registration rules
  password: z
    .string()
    .min(1, "Password is required")
    .max(255, "Password cannot exceed 255 characters"),
});

// ─── TypeScript Types (inferred from schemas) ──────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;