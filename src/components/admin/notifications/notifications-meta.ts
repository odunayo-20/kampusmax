import {
  Bell,
  GraduationCap,
  Layers,
  Megaphone,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Mail,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";
import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  ManagedNotificationAudience,
  ManagedNotificationStatus,
  ManagedNotificationType,
  NotificationDeliveryType,
} from "@/types/admin";

// ------------------------------------------------------------
// TYPES
// ------------------------------------------------------------

export const NOTIFICATION_TYPE_LABELS: Record<ManagedNotificationType, string> =
  {
    system: "System",
    order: "Order",
    payment: "Payment",
    marketplace: "Marketplace",
    campus: "Campus",
    promotion: "Promotion",
    security: "Security",
  };

export function notificationTypeLabel(
  type: ManagedNotificationType
): string {
  return NOTIFICATION_TYPE_LABELS[type] ?? type;
}

export const NOTIFICATION_TYPE_ICONS: Record<
  ManagedNotificationType,
  LucideIcon
> = {
  system: Layers,
  order: ShoppingCart,
  payment: ReceiptText,
  marketplace: Megaphone,
  campus: GraduationCap,
  promotion: Megaphone,
  security: ShieldCheck,
};

export function notificationTypeIcon(
  type: ManagedNotificationType
): LucideIcon {
  return NOTIFICATION_TYPE_ICONS[type] ?? Bell;
}

export function notificationTypeVariant(
  type: ManagedNotificationType
): BadgeVariant {
  switch (type) {
    case "security":
      return "error";
    case "payment":
      return "gold";
    case "promotion":
      return "blue";
    case "campus":
      return "info";
    case "order":
      return "success";
    default:
      return "neutral"; // system, marketplace
  }
}

export const NOTIFICATION_TYPE_FILTER_ORDER: ManagedNotificationType[] = [
  "system",
  "order",
  "payment",
  "marketplace",
  "campus",
  "promotion",
  "security",
];

// ------------------------------------------------------------
// AUDIENCE
// ------------------------------------------------------------

export const AUDIENCE_LABELS: Record<ManagedNotificationAudience, string> = {
  all_users: "All users",
  customers: "Customers",
  vendors: "Vendors",
  campus_admins: "Campus admins",
};

export function audienceLabel(audience: ManagedNotificationAudience): string {
  return AUDIENCE_LABELS[audience] ?? audience;
}

export const AUDIENCE_FILTER_ORDER: ManagedNotificationAudience[] = [
  "all_users",
  "customers",
  "vendors",
  "campus_admins",
];

// ------------------------------------------------------------
// DELIVERY (UI-only channels)
// ------------------------------------------------------------

export const DELIVERY_LABELS: Record<NotificationDeliveryType, string> = {
  in_app: "In-app",
  push: "Push",
  email: "Email",
  sms: "SMS",
};

export const DELIVERY_ICONS: Record<NotificationDeliveryType, LucideIcon> = {
  in_app: Bell,
  push: Smartphone,
  email: Mail,
  sms: MessageSquareText,
};

export const ALL_DELIVERY_TYPES: NotificationDeliveryType[] = [
  "in_app",
  "push",
  "email",
  "sms",
];

// ------------------------------------------------------------
// STATUS
// ------------------------------------------------------------

export const NOTIFICATION_STATUS_LABELS: Record<
  ManagedNotificationStatus,
  string
> = {
  draft: "Draft",
  scheduled: "Scheduled",
  sent: "Sent",
};

export function notificationStatusLabel(
  status: ManagedNotificationStatus
): string {
  return NOTIFICATION_STATUS_LABELS[status] ?? status;
}

export function notificationStatusVariant(
  status: ManagedNotificationStatus
): BadgeVariant {
  switch (status) {
    case "sent":
      return "success";
    case "scheduled":
      return "info";
    default:
      return "warning"; // draft
  }
}

export const NOTIFICATION_STATUS_FILTER_ORDER: ManagedNotificationStatus[] = [
  "draft",
  "scheduled",
  "sent",
];

/** Row-level actions available per status. */
export function notificationActionsFor(n: {
  status: ManagedNotificationStatus;
}): {
  edit?: boolean;
  sendNow?: boolean;
} {
  switch (n.status) {
    case "draft":
      return { edit: true, sendNow: true };
    case "scheduled":
      return { edit: true };
    default:
      return {};
  }
}
