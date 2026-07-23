import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { createJobSchema, jobStatusSchema, jobsQuerySchema } from "../validators/job.validator";
import * as jobService from "../services/job.service";

export async function createJobHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = createJobSchema.parse(req.body);
    const result = await jobService.createJob(req.user!.id, input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listJobsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = jobsQuerySchema.parse(req.query);
    const result = await jobService.listOpenJobs(query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listMyJobsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const jobs = await jobService.listMyJobs(req.user!.id);
    res.status(200).json({ jobs });
  } catch (error) {
    next(error);
  }
}

export async function updateJobStatusHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = jobStatusSchema.parse(req.body);
    const result = await jobService.setJobStatus(req.user!.id, req.params.jobId!, status);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
