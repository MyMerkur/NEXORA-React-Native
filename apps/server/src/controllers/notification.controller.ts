import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import * as notificationService from "../services/notification.service";

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
