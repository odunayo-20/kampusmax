import {
  Bell,
  CreditCard,
  GraduationCap,
  Info,
  Layers,
  Megaphone,
  MessageSquareText,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Tags,
  type LucideIcon,
} from "lucide-react";
import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type { NotificationType, NotificationCategory } from "@/types";
import type {
  ManagedAdminNotificationAudience,
  ManagedAdminNotificationQuery,
} from "@/types/admin";
import { ADMIN_COMPOSABLE_NOTIFICATIONS } from "@/data/admin/communication-management";

// ------------------------------------------------------------
// TYPE MAPS
// ------------------------------------------------------------

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  order_update: "Order",
  message: "Message",
  marketplace: "Marketplace",
  campus: "Campus",
  payments: "Payment",
  account: "Account",
  promotion: "Promotion",
  booking_update: "Booking",
  system: "System",
};

export function notificationTypeLabel(type: NotificationType): string {
  return NOTIFICATION_TYPE_LABELS[type] ?? type;
}

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  order_update: ShoppingCart,
  message: MessageSquareText,
  marketplace: Megaphone,
  campus: GraduationCap,
  payments: Receipt,
  account: ShieldCheck,
  promotion: Megaphone,
  booking_update: Package,
  system: Layers,
};

export function notificationTypeIcon(type: NotificationType): LucideIcon {
  return NOTIFICATION_TYPE_ICONS[type] ?? Bell;
}

export function notificationTypeVariant(type: NotificationType): BadgeVariant {
  switch (type) {
    case "order_update":
      return "success";
    case "payments":
      return "gold";
    case "campus":
      return "info";
    case "promotion":
      return "blue";
    case "account":
      return "warning";
    case "system":
      return "neutral";
    default:
      return "neutral";
  }
}

export const NOTIFICATION_TYPE_FILTER_ORDER: NotificationType[] = [
  "system",
  "order_update",
  "marketplace",
  "campus",
  "payments",
  "account",
  "promotion",
];

// ------------------------------------------------------------
// CATEGORY MAPS
// ------------------------------------------------------------

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  orders: "Orders",
  messages: "Messages",
  marketplace: "Marketplace",
  campus: "Campus",
  payments: "Payments",
  account: "Account",
  promotions: "Promotions",
  bookings: "Bookings",
};

export function notificationCategoryLabel(c: NotificationCategory): string {
  return NOTIFICATION_CATEGORY_LABELS[c] ?? c;
}

export const NOTIFICATION_CATEGORY_ICONS: Record<NotificationCategory, LucideIcon> = {
  orders: ShoppingCart,
  messages: MessageSquareText,
  marketplace: Megaphone,
  campus: GraduationCap,
  payments: Receipt,
  account: ShieldCheck,
  promotions: Tags,
  bookings: Package,
};

export function notificationCategoryIcon(c: NotificationCategory): LucideIcon {
  return NOTIFICATION_CATEGORY_ICONS[c] ?? Bell;
}

export const NOTIFICATION_CATEGORY_FILTER_ORDER: NotificationCategory[] = [
  "orders",
  "messages",
  "marketplace",
  "campus",
  "payments",
  "account",
  "promotions",
  "bookings",
];

// ------------------------------------------------------------
// READ STATE
// ------------------------------------------------------------

export function readStateLabel(read: boolean): string {
  return read ? "Read" : "Unread";
}

export function readStateVariant(read: boolean): BadgeVariant {
  return read ? "neutral" : "info";
}

// ------------------------------------------------------------
// AUDIENCE
// ------------------------------------------------------------

export const AUDIENCE_LABELS: Record<ManagedAdminNotificationAudience, string> = {
  specific_user: "Selected user",
  all_users: "All platform users",
  customers: "Customers (students)",
  vendors: "Vendors",
  campus: "Campus users",
};

export function audienceLabel(audience: ManagedAdminNotificationAudience): string {
  return AUDIENCE_LABELS[audience] ?? audience;
}

export const AUDIENCE_FILTER_ORDER: ManagedAdminNotificationAudience[] = [
  "all_users",
  "customers",
  "vendors",
  "campus",
  "specific_user",
];

// ------------------------------------------------------------
// COMPOSABLE TYPES (for the create form)
// ------------------------------------------------------------

export const COMPOSABLE_TYPES = ADMIN_COMPOSABLE_NOTIFICATIONS.map((c) => c.type);
export const COMPOSABLE_CATEGORIES = ADMIN_COMPOSABLE_NOTIFICATIONS.map((c) => c.category);

// ------------------------------------------------------------
// FILTER HELPERS
// ------------------------------------------------------------

export function hasActiveNotificationFilters(
  query: ManagedAdminNotificationQuery
): boolean {
  return (
    (query.search?.trim().length ?? 0) > 0 ||
    (query.type !== undefined && query.type !== "all") ||
    (query.category !== undefined && query.category !== "all") ||
    (query.read !== undefined && query.read !== "all")
  );
}

export function previewText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}
