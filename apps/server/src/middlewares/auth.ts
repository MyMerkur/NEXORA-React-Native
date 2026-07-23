import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Kimlik doğrulama gerekli" });
    return;
  }

  try {
    const payload = verifyAccessToken(header.slice("Bearer ".length));
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: "Geçersiz veya süresi dolmuş oturum" });
  }
}
