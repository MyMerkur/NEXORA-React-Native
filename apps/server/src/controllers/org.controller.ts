import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import * as orgService from "../services/org.service";

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
