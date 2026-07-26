import type { Request, Response, NextFunction } from "express";
import { checkoutCallbackSchema, subscriptionWebhookSchema } from "../validators/payment.validator";
import * as subscriptionService from "../services/subscription.service";
import * as jobCreditService from "../services/jobCredit.service";

export async function iyzicoCallbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = checkoutCallbackSchema.parse(req.body);
    await subscriptionService.handleCheckoutCallback(token);
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}

export async function jobCreditCallbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = checkoutCallbackSchema.parse(req.body);
    await jobCreditService.handleJobCreditCallback(token);
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}

export async function iyzicoWebhookHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = subscriptionWebhookSchema.parse(req.body);
    const signatureHeader = typeof req.headers["x-iyz-signature-v3"] === "string" ? req.headers["x-iyz-signature-v3"] : "";
    await subscriptionService.handleSubscriptionWebhook(signatureHeader, payload);
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}
