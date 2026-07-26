import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { instagramRateLimiter } from "../middlewares/rateLimiter";
import {
  connectHandler,
  callbackHandler,
  statusHandler,
  mediaHandler,
  disconnectHandler,
} from "../controllers/instagram.controller";

// No blanket requireAuth here: /instagram/oauth/callback is a public redirect target hit by
// Meta's servers (no auth header). Every other route below applies requireAuth explicitly per-route.
export const instagramRouter = Router();

instagramRouter.get("/instagram/connect", requireAuth, connectHandler);
instagramRouter.get("/instagram/oauth/callback", instagramRateLimiter, callbackHandler);
instagramRouter.get("/instagram/status", requireAuth, statusHandler);
instagramRouter.get("/instagram/media", requireAuth, mediaHandler);
instagramRouter.delete("/instagram/connection", requireAuth, disconnectHandler);
