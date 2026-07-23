import { apiClient } from "./authApi";

export type NotificationType = "kyc_status" | "new_application" | "application_status";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const { data } = await apiClient.get<{ notifications: NotificationItem[] }>("/api/v1/notifications");
  return data.notifications;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(`/api/v1/notifications/${id}/read`);
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>("/api/v1/notifications/unread-count");
  return data.count;
}
