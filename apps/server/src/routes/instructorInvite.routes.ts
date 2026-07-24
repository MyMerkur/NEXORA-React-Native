import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/requireAdmin";
import {
  createInviteHandler,
  listInvitesHandler,
  acceptInviteHandler,
} from "../controllers/instructorInvite.controller";

export const instructorInviteRouter = Router();

instructorInviteRouter.use(requireAuth);
instructorInviteRouter.post("/admin/instructor-invites", requireAdmin, createInviteHandler);
instructorInviteRouter.get("/admin/instructor-invites", requireAdmin, listInvitesHandler);
instructorInviteRouter.post("/instructor-invites/:token/accept", acceptInviteHandler);
