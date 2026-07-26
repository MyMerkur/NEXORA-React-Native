import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import * as orgService from "../services/org.service";
import * as clinicReviewService from "../services/clinicReview.service";
import * as orgAnnouncementService from "../services/orgAnnouncement.service";
import * as orgVoteService from "../services/orgVote.service";
import { rateOrgSchema } from "../validators/review.validator";
import { createAnnouncementSchema } from "../validators/orgAnnouncement.validator";
import { createVoteSchema, castBallotSchema } from "../validators/orgVote.validator";

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

export async function createAnnouncementHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = createAnnouncementSchema.parse(req.body);
    const result = await orgAnnouncementService.createAnnouncement(req.user!.id, req.params.orgId!, input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listAnnouncementsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const announcements = await orgAnnouncementService.listAnnouncements(req.user!.id, req.params.orgId!);
    res.status(200).json({ announcements });
  } catch (error) {
    next(error);
  }
}

export async function createVoteHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = createVoteSchema.parse(req.body);
    const result = await orgVoteService.createVote(req.user!.id, req.params.orgId!, input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listVotesHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const votes = await orgVoteService.listVotes(req.user!.id, req.params.orgId!);
    res.status(200).json({ votes });
  } catch (error) {
    next(error);
  }
}

export async function castBallotHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { optionIndex } = castBallotSchema.parse(req.body);
    const result = await orgVoteService.castBallot(req.user!.id, req.params.voteId!, optionIndex);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function closeVoteHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await orgVoteService.closeVote(req.user!.id, req.params.voteId!);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
