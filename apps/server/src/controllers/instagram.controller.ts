import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { instagramCallbackQuerySchema } from "../validators/instagram.validator";
import * as instagramService from "../services/instagram.service";

export async function connectHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await instagramService.startConnect(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function callbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = instagramCallbackQuerySchema.parse(req.query);
    const html = await instagramService.handleOauthCallback(query);
    res.status(200).type("html").send(html);
  } catch (error) {
    next(error);
  }
}

export async function statusHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await instagramService.getConnectionStatus(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function mediaHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const items = await instagramService.listRecentMedia(req.user!.id);
    res.status(200).json({ items });
  } catch (error) {
    next(error);
  }
}

export async function disconnectHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await instagramService.disconnectInstagram(req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
