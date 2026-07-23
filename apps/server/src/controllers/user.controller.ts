import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { updateShowcaseSchema, updateCareerSchema, avatarUploadUrlSchema } from "../validators/user.validator";
import * as userService from "../services/user.service";

export async function meHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await userService.getMe(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateShowcaseHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const patch = updateShowcaseSchema.parse(req.body);
    const result = await userService.updateShowcase(req.user!.id, patch);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateCareerHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const patch = updateCareerSchema.parse(req.body);
    const result = await userService.updateCareer(req.user!.id, patch);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function avatarUploadUrlHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { contentType } = avatarUploadUrlSchema.parse(req.body);
    const result = await userService.requestAvatarUploadUrl(req.user!.id, contentType);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
