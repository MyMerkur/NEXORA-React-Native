import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { createCaseSchema, imageUploadUrlSchema, feedQuerySchema } from "../validators/case.validator";
import * as caseService from "../services/case.service";

export async function imageUploadUrlHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { contentType } = imageUploadUrlSchema.parse(req.body);
    const result = await caseService.requestImageUploadUrl(req.user!.id, contentType);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function createCaseHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = createCaseSchema.parse(req.body);
    const result = await caseService.createCase(req.user!.id, input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function feedHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = feedQuerySchema.parse(req.query);
    const result = await caseService.getFeed(query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
