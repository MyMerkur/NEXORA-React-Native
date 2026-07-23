import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  meHandler,
  updateShowcaseHandler,
  updateCareerHandler,
  avatarUploadUrlHandler,
  updateAffiliationHandler,
} from "../controllers/user.controller";

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get("/users/me", meHandler);
userRouter.patch("/users/me/showcase", updateShowcaseHandler);
userRouter.patch("/users/me/career", updateCareerHandler);
userRouter.post("/users/me/avatar-upload-url", avatarUploadUrlHandler);
userRouter.patch("/users/me/affiliation", updateAffiliationHandler);
