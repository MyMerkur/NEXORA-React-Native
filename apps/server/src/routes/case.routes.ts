import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { imageUploadUrlHandler, createCaseHandler, feedHandler } from "../controllers/case.controller";

export const caseRouter = Router();

caseRouter.use(requireAuth);
caseRouter.post("/cases/image-upload-url", imageUploadUrlHandler);
caseRouter.post("/cases", createCaseHandler);
caseRouter.get("/cases", feedHandler);
