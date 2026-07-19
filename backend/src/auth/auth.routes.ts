// src/auth/auth.routes.ts — Auth route definitions

import { Router } from "express";
import { register, login, googleAuth } from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);

export default router;