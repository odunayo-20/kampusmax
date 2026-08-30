import { Notification, NotificationCategory } from "@/types";
import {
  notifications as mockNotifications,
  getNotificationsByUser as _getNotificationsByUser,
  getUnreadCount as _getUnreadCount,
} from "@/data/notifications";

const categoryLabels: Record<NotificationCategory, string> = {
  orders: "Orders",
  messages: "Messages",
  marketplace: "Marketplace",
  campus: "Campus",
  payments: "Payments",
  account: "Account",
  promotions: "Promotions",
  bookings: "Bookings",
};

export { categoryLabels };

/**
 * Push a notification for a user (unshift + unread). Used by the booking
 * service to emit booking_update notifications. Mirrors a backend push so the
 * notification feed, badges, and category tabs all react immediately.
 */
export function pushUserNotification(input: {
  userId: string;
  type: Notification["type"];
  category: Notification["category"];
  title: string;
  message: string;
  actionUrl?: string;
  groupId?: string;
}): Notification {
  const notification: Notification = {
    id: `n_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    userId: input.userId,
    type: input.type,
    category: input.category,
    title: input.title,
    message: input.message,
    read: false,
    createdAt: new Date().toISOString(),
    actionUrl: input.actionUrl,
    groupId: input.groupId,
  };
  mockNotifications.unshift(notification);
  return notification;
}

export function getNotifications(userId: string): Notification[] {
  return _getNotificationsByUser(userId);
}

export function getUnreadNotificationCount(userId: string): number {
  return _getUnreadCount(userId);
}

export function getNotificationsByCategory(
  userId: string,
  category: NotificationCategory
): Notification[] {
  return _getNotificationsByUser(userId).filter(
    (n) => n.category === category
  );
}

export function getUnreadCountByCategory(
  userId: string,
  category: NotificationCategory
): number {
  return mockNotifications.filter(
    (n) => n.userId === userId && n.category === category && !n.read
  ).length;
}

export function getGroupedNotifications(
  userId: string
): { category: NotificationCategory; label: string; notifications: Notification[] }[] {
  const groups: Record<string, Notification[]> = {};
  const userNotifs = _getNotificationsByUser(userId);

  for (const notif of userNotifs) {
    if (!groups[notif.category]) groups[notif.category] = [];
    groups[notif.category].push(notif);
  }

  const order: NotificationCategory[] = [
    "orders",
    "messages",
    "marketplace",
    "bookings",
    "campus",
    "payments",
    "account",
    "promotions",
  ];

  return order
    .filter((cat) => groups[cat]?.length)
    .map((cat) => ({
      category: cat,
      label: categoryLabels[cat],
      notifications: groups[cat],
    }));
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

export function deleteNotification(notificationId: string): boolean {
  const idx = mockNotifications.findIndex((n) => n.id === notificationId);
  if (idx === -1) return false;
  mockNotifications.splice(idx, 1);
  return true;
}
