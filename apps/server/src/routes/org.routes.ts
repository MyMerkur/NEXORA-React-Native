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
  createDuesPlanHandler,
  getDuesPlanHandler,
  startDuesCheckoutHandler,
  cancelDuesSubscriptionHandler,
  getMyDuesStatusHandler,
  listDuesSubscribersHandler,
  listAffiliationRequestsHandler,
  approveAffiliationRequestHandler,
  rejectAffiliationRequestHandler,
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
orgRouter.post("/orgs/:orgId/dues-plan", createDuesPlanHandler);
orgRouter.get("/orgs/:orgId/dues-plan", getDuesPlanHandler);
orgRouter.post("/orgs/:orgId/dues/checkout", startDuesCheckoutHandler);
orgRouter.post("/orgs/:orgId/dues/cancel", cancelDuesSubscriptionHandler);
orgRouter.get("/orgs/:orgId/dues/mine", getMyDuesStatusHandler);
orgRouter.get("/orgs/:orgId/dues/subscribers", listDuesSubscribersHandler);
orgRouter.get("/orgs/:orgId/affiliation-requests", listAffiliationRequestsHandler);
orgRouter.post("/orgs/:orgId/affiliation-requests/:requestId/approve", approveAffiliationRequestHandler);
orgRouter.post("/orgs/:orgId/affiliation-requests/:requestId/reject", rejectAffiliationRequestHandler);
