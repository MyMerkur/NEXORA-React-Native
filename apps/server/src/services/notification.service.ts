import { Types } from "mongoose";
import {
  createNotification as createNotificationRecord,
  listByUser,
  markRead as markReadRecord,
  countUnread,
} from "../repositories/notification.repository";
import { findUserById } from "../repositories/user.repository";
import { sendEmail, EmailNotConfiguredError } from "./email.service";
import { logger } from "../utils/logger";
import { HttpError } from "../utils/httpError";
import type { NotificationType } from "../models/Notification";

async function createNotification(userId: string, type: NotificationType, title: string, body: string) {
  const notification = await createNotificationRecord({
    userId: new Types.ObjectId(userId),
    type,
    title,
    body,
  });

  try {
    const user = await findUserById(userId);
    if (user) {
      await sendEmail({ to: user.email, subject: title, text: body });
    }
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      logger.info("notification.email.skipped", { userId, reason: error.message });
    } else {
      logger.error("notification.email.failed", {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return notification;
}

export async function notifyKycStatusChange(userId: string, documentType: string, status: string) {
  const label = documentType === "kimlik" ? "Kimlik" : "Diploma";
  const statusText: Record<string, string> = {
    approved: "onaylandı",
    rejected: "reddedildi",
    needs_review: "manuel incelemeye alındı",
  };
  const title = `${label} belgeniz ${statusText[status] ?? status}`;
  await createNotification(userId, "kyc_status", title, title);
}

export async function notifyNewApplication(employerId: string, jobTitle: string, applicantName: string) {
  const title = "Yeni başvuru";
  const body = `${applicantName}, "${jobTitle}" ilanınıza başvurdu`;
  await createNotification(employerId, "new_application", title, body);
}

export async function notifyApplicationStatusChange(applicantId: string, jobTitle: string, status: string) {
  const statusText = status === "accepted" ? "onaylandı" : "reddedildi";
  const title = `Başvurunuz ${statusText}`;
  const body = `"${jobTitle}" ilanına yaptığınız başvuru ${statusText}`;
  await createNotification(applicantId, "application_status", title, body);
}

export async function notifyNewMessage(recipientId: string, senderName: string) {
  const title = "Yeni mesaj";
  const body = `${senderName} size bir mesaj gönderdi`;
  await createNotification(recipientId, "new_message", title, body);
}

export async function notifyNewMatch(userId: string, counterpartName: string, jobTitle: string) {
  const title = "Yeni eşleşme";
  const body = `${counterpartName} ile "${jobTitle}" ilanı üzerinden eşleştiniz`;
  await createNotification(userId, "new_match", title, body);
}

export async function notifyReferenceRequested(authorId: string, subjectName: string) {
  const title = "Referans isteği";
  const body = `${subjectName} sizden bir referans yazmanızı istedi`;
  await createNotification(authorId, "reference_request", title, body);
}

export async function notifyReferenceWritten(subjectId: string, authorName: string) {
  const title = "Yeni referans";
  const body = `${authorName} sizin için bir referans yazdı`;
  await createNotification(subjectId, "reference_written", title, body);
}

export async function listNotifications(userId: string) {
  const notifications = await listByUser(new Types.ObjectId(userId));
  return notifications.map((notification) => ({
    id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    body: notification.body,
    read: notification.read,
    createdAt: notification.createdAt,
  }));
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const updated = await markReadRecord(notificationId, new Types.ObjectId(userId));
  if (!updated) {
    throw new HttpError("Bildirim bulunamadı", 404);
  }
  return { id: updated._id.toString(), read: updated.read };
}

export async function getUnreadCount(userId: string) {
  const count = await countUnread(new Types.ObjectId(userId));
  return { count };
}
