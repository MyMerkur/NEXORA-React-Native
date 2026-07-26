import { Router, urlencoded } from "express";
import { paymentRateLimiter } from "../middlewares/rateLimiter";
import { iyzicoCallbackHandler, iyzicoWebhookHandler, jobCreditCallbackHandler } from "../controllers/payment.controller";

// No requireAuth: these are server-to-server / browser redirect callbacks from iyzico, not user sessions.
export const paymentRouter = Router();

paymentRouter.post(
  "/payments/iyzico/callback",
  paymentRateLimiter,
  urlencoded({ extended: false }),
  iyzicoCallbackHandler,
);
paymentRouter.post("/payments/iyzico/webhook", paymentRateLimiter, iyzicoWebhookHandler);
paymentRouter.post(
  "/payments/iyzico/job-credit-callback",
  paymentRateLimiter,
  urlencoded({ extended: false }),
  jobCreditCallbackHandler,
);
