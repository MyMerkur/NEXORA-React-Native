import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { swipeSchema } from "../validators/matching.validator";
import * as matchingService from "../services/matching.service";

export async function getJobSwipeFeedHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await matchingService.getJobSwipeFeed(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function swipeJobHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { direction } = swipeSchema.parse(req.body);
    const result = await matchingService.swipeJob(req.user!.id, req.params.jobId!, direction);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getCandidateSwipeFeedHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await matchingService.getCandidateSwipeFeed(req.user!.id, req.params.jobId!);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function swipeCandidateHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { direction } = swipeSchema.parse(req.body);
    const result = await matchingService.swipeCandidate(
      req.user!.id,
      req.params.jobId!,
      req.params.candidateId!,
      direction,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getMatchesHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const matches = await matchingService.getMatches(req.user!.id);
    res.status(200).json({ matches });
  } catch (error) {
    next(error);
  }
}
