import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { jobCreditCheckoutSchema } from "../validators/jobCredit.validator";
import * as jobCreditService from "../services/jobCredit.service";

export async function startJobCreditCheckoutHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const billingInfo = jobCreditCheckoutSchema.parse(req.body);
    const result = await jobCreditService.startJobCreditCheckout(req.user!.id, billingInfo);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getJobCreditBalanceHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await jobCreditService.getJobCreditBalance(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
