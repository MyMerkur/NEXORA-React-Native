import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { createJobHandler, listJobsHandler, listMyJobsHandler, updateJobStatusHandler } from "../controllers/job.controller";

export const jobRouter = Router();

jobRouter.use(requireAuth);
jobRouter.post("/jobs", createJobHandler);
jobRouter.get("/jobs", listJobsHandler);
jobRouter.get("/jobs/mine", listMyJobsHandler);
jobRouter.patch("/jobs/:jobId/status", updateJobStatusHandler);
