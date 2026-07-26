import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  searchOrgsHandler,
  getOrgProfileHandler,
  rateOrgHandler,
  listOrgReviewsHandler,
  createAnnouncementHandler,
  listAnnouncementsHandler,
  createVoteHandler,
  listVotesHandler,
  castBallotHandler,
  closeVoteHandler,
} from "../controllers/org.controller";

export const orgRouter = Router();

orgRouter.use(requireAuth);
orgRouter.get("/orgs/search", searchOrgsHandler);
orgRouter.get("/orgs/:userId", getOrgProfileHandler);
orgRouter.post("/orgs/:orgId/reviews", rateOrgHandler);
orgRouter.get("/orgs/:orgId/reviews", listOrgReviewsHandler);
orgRouter.post("/orgs/:orgId/announcements", createAnnouncementHandler);
orgRouter.get("/orgs/:orgId/announcements", listAnnouncementsHandler);
orgRouter.post("/orgs/:orgId/votes", createVoteHandler);
orgRouter.get("/orgs/:orgId/votes", listVotesHandler);
orgRouter.post("/orgs/votes/:voteId/ballot", castBallotHandler);
orgRouter.post("/orgs/votes/:voteId/close", closeVoteHandler);
