import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  getJobSwipeFeedHandler,
  swipeJobHandler,
  getCandidateSwipeFeedHandler,
  swipeCandidateHandler,
  getMatchesHandler,
} from "../controllers/matching.controller";

export const matchingRouter = Router();

matchingRouter.use(requireAuth);
matchingRouter.get("/matching/jobs/feed", getJobSwipeFeedHandler);
matchingRouter.get("/matching/matches", getMatchesHandler);
matchingRouter.post("/matching/jobs/:jobId/swipe", swipeJobHandler);
matchingRouter.get("/matching/jobs/:jobId/candidates", getCandidateSwipeFeedHandler);
matchingRouter.post("/matching/jobs/:jobId/candidates/:candidateId/swipe", swipeCandidateHandler);
