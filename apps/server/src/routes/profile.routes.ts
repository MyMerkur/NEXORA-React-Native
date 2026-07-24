import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { getPublicProfileHandler } from "../controllers/profile.controller";

export const profileRouter = Router();

profileRouter.use(requireAuth);
profileRouter.get("/profiles/:userId", getPublicProfileHandler);
