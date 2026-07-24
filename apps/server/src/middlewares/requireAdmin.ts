import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth";
import { findUserById } from "../repositories/user.repository";
import { env } from "../config/env";

export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = await findUserById(req.user!.id);
  if (!user || !env.ADMIN_EMAILS.includes(user.email)) {
    res.status(403).json({ message: "Bu işlem için yönetici yetkisi gerekli" });
    return;
  }
  next();
}
