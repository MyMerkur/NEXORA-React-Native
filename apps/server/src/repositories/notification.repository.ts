import type { Types } from "mongoose";
import { NotificationModel, type NotificationType } from "../models/Notification";

interface CreateNotificationInput {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
}

export async function createNotification(data: CreateNotificationInput) {
  return NotificationModel.create(data);
}

export async function listByUser(userId: Types.ObjectId) {
  return NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50);
}

export async function markRead(id: string, userId: Types.ObjectId) {
  return NotificationModel.findOneAndUpdate({ _id: id, userId }, { read: true }, { new: true });
}

export async function countUnread(userId: Types.ObjectId) {
  return NotificationModel.countDocuments({ userId, read: false });
}
