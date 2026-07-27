import type { Request, Response, NextFunction } from "express";
import { checkoutCallbackSchema, subscriptionWebhookSchema } from "../validators/payment.validator";
import * as subscriptionService from "../services/subscription.service";
import * as jobCreditService from "../services/jobCredit.service";
import * as hubService from "../services/hub.service";
import * as orgDuesService from "../services/orgDues.service";
import * as eventTicketService from "../services/eventTicket.service";
import * as sniperCreditService from "../services/sniperCredit.service";
import * as paymentWebhookRouterService from "../services/paymentWebhookRouter.service";

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
    await paymentWebhookRouterService.routeSubscriptionWebhook(signatureHeader, payload);
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}

export async function hubMembershipCallbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = checkoutCallbackSchema.parse(req.body);
    await hubService.handleHubMembershipCallback(token);
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}

export async function duesCallbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = checkoutCallbackSchema.parse(req.body);
    await orgDuesService.handleDuesCallback(token);
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}

export async function eventTicketCallbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = checkoutCallbackSchema.parse(req.body);
    await eventTicketService.handleTicketCallback(token);
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}

export async function sniperCreditCallbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = checkoutCallbackSchema.parse(req.body);
    await sniperCreditService.handleSniperCreditCallback(token);
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}
