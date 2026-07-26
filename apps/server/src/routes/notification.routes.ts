import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  listNotificationsHandler,
  markReadHandler,
  unreadCountHandler,
  registerDeviceTokenHandler,
} from "../controllers/notification.controller";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get("/notifications", listNotificationsHandler);
notificationRouter.get("/notifications/unread-count", unreadCountHandler);
notificationRouter.patch("/notifications/:notificationId/read", markReadHandler);
notificationRouter.post("/notifications/device-token", registerDeviceTokenHandler);
