import { Request, Response } from "express";
import { ZodError } from "zod";
import { registerSchema } from "./auth.validator";

export async function registerUser(req: Request, res: Response) {
  try {
    registerSchema.parse(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}