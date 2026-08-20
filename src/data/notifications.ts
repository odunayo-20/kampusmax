import { Notification } from "@/types";

export const notifications: Notification[] = [
  {
    id: "n1",
    userId: "u1",
    type: "order_update",
    title: "Order Confirmed",
    message: "Your order #KMP-4102 has been confirmed by StyleByChi.",
    read: false,
    createdAt: "2025-01-14T15:30:00Z",
    actionUrl: "/orders/KMP-4102",
  },
  {
    id: "n2",
    userId: "u1",
    type: "order_update",
    title: "Order Delivered",
    message: "Your order #KMP-3847 has been delivered. Rate your experience!",
    read: true,
    createdAt: "2025-01-12T10:15:00Z",
    actionUrl: "/orders/KMP-3847",
  },
  {
    id: "n3",
    userId: "u1",
    type: "promotion",
    title: "Weekend Flash Sale",
    message: "Up to 40% off electronics at TechHub Owo this weekend!",
    read: false,
    createdAt: "2025-01-14T08:00:00Z",
  },
  {
    id: "n4",
    userId: "u1",
    type: "message",
    title: "New Message",
    message: "Ibrahim from TechHub Owo sent you a message about your inquiry.",
    read: true,
    createdAt: "2025-01-13T14:22:00Z",
    actionUrl: "/chat",
  },
  {
    id: "n5",
    userId: "u1",
    type: "community",
    title: "New Post in RUGIPO",
    message: "Emeka posted a new event: 'End of Semester Sale' in Campus Events.",
    read: false,
    createdAt: "2025-01-14T12:00:00Z",
    actionUrl: "/campus",
  },
  {
    id: "n6",
    userId: "u1",
    type: "system",
    title: "Welcome to Kampmax",
    message: "Your account has been verified. Start buying and selling on campus!",
    read: true,
    createdAt: "2024-09-01T09:00:00Z",
  },
];

export function getNotificationsByUser(userId: string): Notification[] {
  return notifications.filter((n) => n.userId === userId);
}

export function getUnreadCount(userId: string): number {
  return notifications.filter((n) => n.userId === userId && !n.read).length;
}
