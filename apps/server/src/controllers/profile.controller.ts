import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { getPublicProfile } from "../services/publicProfile.service";

export async function getPublicProfileHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await getPublicProfile(req.params.userId!);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
