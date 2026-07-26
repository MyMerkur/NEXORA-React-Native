import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { paymentRateLimiter } from "../middlewares/rateLimiter";
import { startJobCreditCheckoutHandler, getJobCreditBalanceHandler } from "../controllers/jobCredit.controller";

export const jobCreditRouter = Router();

jobCreditRouter.use(requireAuth);
jobCreditRouter.post("/job-credits/checkout", paymentRateLimiter, startJobCreditCheckoutHandler);
jobCreditRouter.get("/job-credits/balance", getJobCreditBalanceHandler);
