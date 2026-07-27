import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  searchCandidatesHandler,
  unlockCandidateHandler,
  startSniperCreditCheckoutHandler,
  getSniperCreditBalanceHandler,
} from "../controllers/sniper.controller";

export const sniperRouter = Router();

sniperRouter.use(requireAuth);
sniperRouter.get("/sniper/candidates", searchCandidatesHandler);
sniperRouter.post("/sniper/candidates/:candidateId/unlock", unlockCandidateHandler);
sniperRouter.post("/sniper/credits/checkout", startSniperCreditCheckoutHandler);
sniperRouter.get("/sniper/credits/balance", getSniperCreditBalanceHandler);
