import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { sniperSearchQuerySchema, sniperCreditCheckoutSchema } from "../validators/sniper.validator";
import * as sniperService from "../services/sniper.service";
import * as sniperCreditService from "../services/sniperCredit.service";

export async function searchCandidatesHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = sniperSearchQuerySchema.parse(req.query);
    const specialties = query.specialties
      ? query.specialties.split(",").map((tag) => tag.trim()).filter(Boolean)
      : undefined;
    const result = await sniperService.searchCandidates(req.user!.id, {
      specialties,
      city: query.city,
      minExperienceYears: query.minExperienceYears,
      maxExperienceYears: query.maxExperienceYears,
      limit: query.limit,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function unlockCandidateHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await sniperService.unlockCandidate(req.user!.id, req.params.candidateId!);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function startSniperCreditCheckoutHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const billingInfo = sniperCreditCheckoutSchema.parse(req.body);
    const result = await sniperCreditService.startSniperCreditCheckout(req.user!.id, billingInfo);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getSniperCreditBalanceHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await sniperCreditService.getSniperCreditBalance(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
