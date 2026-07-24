import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { aiDraftRateLimiter } from "../middlewares/rateLimiter";
import {
  imageUploadUrlHandler,
  createCaseHandler,
  feedHandler,
  generateCaseDraftHandler,
} from "../controllers/case.controller";

export const caseRouter = Router();

caseRouter.use(requireAuth);
caseRouter.post("/cases/image-upload-url", imageUploadUrlHandler);
caseRouter.post("/cases/ai-draft", aiDraftRateLimiter, generateCaseDraftHandler);
caseRouter.post("/cases", createCaseHandler);
caseRouter.get("/cases", feedHandler);
