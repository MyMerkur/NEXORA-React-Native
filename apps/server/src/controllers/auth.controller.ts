import type { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import * as authService from "../services/auth.service";

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, role } = registerSchema.parse(req.body);
    const result = await authService.register(email, password, role);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
