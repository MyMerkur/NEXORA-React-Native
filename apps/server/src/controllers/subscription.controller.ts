import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { startCheckoutSchema } from "../validators/subscription.validator";
import * as subscriptionService from "../services/subscription.service";

export async function startCheckoutHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { planCode, ...billingInfo } = startCheckoutSchema.parse(req.body);
    const result = await subscriptionService.startSubscriptionCheckout(req.user!.id, planCode, billingInfo);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getStatusHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await subscriptionService.getSubscriptionStatus(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function cancelSubscriptionHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await subscriptionService.cancelSubscription(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
