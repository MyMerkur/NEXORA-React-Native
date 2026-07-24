import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { searchOrgsHandler, getOrgProfileHandler, rateOrgHandler, listOrgReviewsHandler } from "../controllers/org.controller";

export const orgRouter = Router();

orgRouter.use(requireAuth);
orgRouter.get("/orgs/search", searchOrgsHandler);
orgRouter.get("/orgs/:userId", getOrgProfileHandler);
orgRouter.post("/orgs/:orgId/reviews", rateOrgHandler);
orgRouter.get("/orgs/:orgId/reviews", listOrgReviewsHandler);
