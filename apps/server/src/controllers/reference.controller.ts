import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import {
  requestReferenceSchema,
  writeReferenceSchema,
  fulfillReferenceSchema,
  referenceVisibilitySchema,
} from "../validators/reference.validator";
import * as referenceService from "../services/reference.service";

export async function requestReferenceHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { targetUserId } = requestReferenceSchema.parse(req.body);
    const result = await referenceService.requestReference(req.user!.id, targetUserId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function writeReferenceHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = writeReferenceSchema.parse(req.body);
    const result = await referenceService.writeReference(req.user!.id, input.targetUserId, input.relationship ?? "", input.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function fulfillReferenceHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = fulfillReferenceSchema.parse(req.body);
    const result = await referenceService.fulfillReferenceRequest(
      req.user!.id,
      req.params.referenceId!,
      input.relationship ?? "",
      input.body,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listIncomingRequestsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const references = await referenceService.listIncomingRequests(req.user!.id);
    res.status(200).json({ references });
  } catch (error) {
    next(error);
  }
}

export async function listMyReferencesHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const references = await referenceService.listMyReferences(req.user!.id);
    res.status(200).json({ references });
  } catch (error) {
    next(error);
  }
}

export async function setReferenceVisibilityHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { hidden } = referenceVisibilitySchema.parse(req.body);
    const result = await referenceService.setVisibility(req.user!.id, req.params.referenceId!, hidden);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
