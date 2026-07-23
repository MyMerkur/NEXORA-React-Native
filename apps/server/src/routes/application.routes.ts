import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  applyToJobHandler,
  listJobApplicationsHandler,
  listMyApplicationsHandler,
  updateApplicationStatusHandler,
} from "../controllers/application.controller";

export const applicationRouter = Router();

applicationRouter.use(requireAuth);
applicationRouter.post("/jobs/:jobId/applications", applyToJobHandler);
applicationRouter.get("/jobs/:jobId/applications", listJobApplicationsHandler);
applicationRouter.get("/applications/mine", listMyApplicationsHandler);
applicationRouter.patch("/applications/:applicationId/status", updateApplicationStatusHandler);
