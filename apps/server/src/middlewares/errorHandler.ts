import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AuthError } from "../services/auth.service";
import { logger } from "../utils/logger";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: "Geçersiz istek", issues: err.issues });
  }

  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  logger.error(err instanceof Error ? err.stack : String(err));
  return res.status(500).json({ message: "Sunucu hatası" });
}
