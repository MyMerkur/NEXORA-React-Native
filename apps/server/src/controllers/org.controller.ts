import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import * as orgService from "../services/org.service";
import * as clinicReviewService from "../services/clinicReview.service";
import { rateOrgSchema } from "../validators/review.validator";

export async function searchOrgsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = typeof req.query.q === "string" ? req.query.q : "";
    const orgs = await orgService.searchOrgs(query);
    res.status(200).json({ orgs });
  } catch (error) {
    next(error);
  }
}

export async function getOrgProfileHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await orgService.getOrgProfile(req.params.userId!);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function rateOrgHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { rating, comment } = rateOrgSchema.parse(req.body);
    const result = await clinicReviewService.rateOrg(req.user!.id, req.params.orgId!, rating, comment ?? "");
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listOrgReviewsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const reviews = await clinicReviewService.listOrgReviews(req.params.orgId!);
    res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
}
