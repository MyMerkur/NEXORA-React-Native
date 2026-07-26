import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createHubHandler,
  discoverHubsHandler,
  listMyHubsHandler,
  listManagedHubsHandler,
  getHubDetailHandler,
  joinFreeHubHandler,
  startHubMembershipCheckoutHandler,
  leaveHubHandler,
  hubPostImageUploadUrlHandler,
  createHubPostHandler,
  listHubFeedHandler,
} from "../controllers/hub.controller";

export const hubRouter = Router();

hubRouter.use(requireAuth);
hubRouter.post("/hubs", createHubHandler);
hubRouter.get("/hubs", discoverHubsHandler);
hubRouter.get("/hubs/mine", listMyHubsHandler);
hubRouter.get("/hubs/managed", listManagedHubsHandler);
hubRouter.get("/hubs/:hubId", getHubDetailHandler);
hubRouter.post("/hubs/:hubId/join", joinFreeHubHandler);
hubRouter.post("/hubs/:hubId/membership/checkout", startHubMembershipCheckoutHandler);
hubRouter.post("/hubs/:hubId/leave", leaveHubHandler);
hubRouter.post("/hubs/:hubId/posts/image-upload-url", hubPostImageUploadUrlHandler);
hubRouter.post("/hubs/:hubId/posts", createHubPostHandler);
hubRouter.get("/hubs/:hubId/posts", listHubFeedHandler);
