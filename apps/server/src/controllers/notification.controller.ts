import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import * as notificationService from "../services/notification.service";
import { registerDeviceTokenSchema } from "../validators/pushNotification.validator";

export async function listNotificationsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const notifications = await notificationService.listNotifications(req.user!.id);
    res.status(200).json({ notifications });
  } catch (error) {
    next(error);
  }
}

export async function markReadHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await notificationService.markNotificationRead(req.user!.id, req.params.notificationId!);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function unreadCountHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await notificationService.getUnreadCount(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function registerDeviceTokenHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { token, platform } = registerDeviceTokenSchema.parse(req.body);
    await notificationService.registerDeviceToken(req.user!.id, token, platform);
    res.status(200).json({ registered: true });
  } catch (error) {
    next(error);
  }
}
