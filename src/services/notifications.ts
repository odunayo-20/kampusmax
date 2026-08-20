import { Notification } from "@/types";
import {
  notifications as mockNotifications,
  getNotificationsByUser as _getNotificationsByUser,
  getUnreadCount as _getUnreadCount,
} from "@/data/notifications";

export function getNotifications(userId: string): Notification[] {
  return _getNotificationsByUser(userId);
}

export function getUnreadNotificationCount(userId: string): number {
  return _getUnreadCount(userId);
}

export function markAsRead(notificationId: string): void {
  const n = mockNotifications.find((n) => n.id === notificationId);
  if (n) n.read = true;
}

export function markAllAsRead(userId: string): void {
  mockNotifications
    .filter((n) => n.userId === userId)
    .forEach((n) => (n.read = true));
}
