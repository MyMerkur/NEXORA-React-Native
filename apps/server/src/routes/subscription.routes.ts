import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { paymentRateLimiter } from "../middlewares/rateLimiter";
import { startCheckoutHandler, getStatusHandler, cancelSubscriptionHandler } from "../controllers/subscription.controller";

export const subscriptionRouter = Router();

subscriptionRouter.use(requireAuth);
subscriptionRouter.post("/subscriptions/checkout", paymentRateLimiter, startCheckoutHandler);
subscriptionRouter.get("/subscriptions/status", getStatusHandler);
subscriptionRouter.post("/subscriptions/cancel", cancelSubscriptionHandler);
