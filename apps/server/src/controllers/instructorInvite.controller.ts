import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { createInviteSchema, acceptInviteSchema } from "../validators/instructorInvite.validator";
import * as instructorInviteService from "../services/instructorInvite.service";

export async function createInviteHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { email } = createInviteSchema.parse(req.body);
    const result = await instructorInviteService.createInvite(req.user!.id, email);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listInvitesHandler(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const invites = await instructorInviteService.listInvites();
    res.status(200).json({ invites });
  } catch (error) {
    next(error);
  }
}

export async function acceptInviteHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    acceptInviteSchema.parse({ token: req.params.token });
    const result = await instructorInviteService.acceptInvite(req.user!.id, req.params.token!);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
