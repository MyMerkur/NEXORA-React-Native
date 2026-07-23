import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { applySchema, applicationStatusSchema } from "../validators/application.validator";
import * as applicationService from "../services/application.service";

export async function applyToJobHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { message } = applySchema.parse(req.body);
    const result = await applicationService.applyToJob(req.user!.id, req.params.jobId!, message);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listJobApplicationsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const applications = await applicationService.listJobApplications(req.user!.id, req.params.jobId!);
    res.status(200).json({ applications });
  } catch (error) {
    next(error);
  }
}

export async function listMyApplicationsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const applications = await applicationService.listMyApplications(req.user!.id);
    res.status(200).json({ applications });
  } catch (error) {
    next(error);
  }
}

export async function updateApplicationStatusHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = applicationStatusSchema.parse(req.body);
    const result = await applicationService.updateApplicationStatus(req.user!.id, req.params.applicationId!, status);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
