import {
  BarChart3,
  BadgeCheck,
  Ban,
  Bell,
  BookOpenCheck,
  FileDown,
  Landmark,
  Megaphone,
  MessageSquareText,
  Package,
  Pencil,
  PlusCircle,
  Scale,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Tags,
  Trash2,
  Undo2,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  AuditActionType,
  AuditResource,
  AuditResult,
} from "@/types/admin";

// ------------------------------------------------------------
// ACTIONS
// ------------------------------------------------------------

export const AUDIT_ACTION_LABELS: Record<AuditActionType, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  approve: "Approved",
  reject: "Rejected",
  suspend: "Suspended",
  restore: "Restored",
  resolve: "Resolved",
  publish: "Published",
  send: "Sent",
  export: "Exported",
};

export function auditActionLabel(action: AuditActionType): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

export const AUDIT_ACTION_ICONS: Record<AuditActionType, LucideIcon> = {
  create: PlusCircle,
  update: Pencil,
  delete: Trash2,
  approve: BadgeCheck,
  reject: ShieldCheck,
  suspend: Ban,
  restore: Undo2,
  resolve: BookOpenCheck,
  publish: Megaphone,
  send: Megaphone,
  export: FileDown,
};

export function auditActionVariant(action: AuditActionType): BadgeVariant {
  switch (action) {
    case "approve":
    case "restore":
      return "success";
    case "delete":
    case "suspend":
      return "error";
    case "reject":
      return "warning";
    case "publish":
    case "send":
      return "blue";
    default:
      return "info"; // create, update, resolve, export
  }
}

export const AUDIT_ACTION_FILTER_ORDER: AuditActionType[] = [
  "approve",
  "reject",
  "suspend",
  "restore",
  "resolve",
  "create",
  "update",
  "delete",
  "publish",
  "send",
  "export",
];

// ------------------------------------------------------------
// RESOURCES
// ------------------------------------------------------------

export const AUDIT_RESOURCE_LABELS: Record<AuditResource, string> = {
  vendor: "Vendor",
  user: "User",
  product: "Product",
  category: "Category",
  withdrawal: "Withdrawal",
  platform_setting: "Platform setting",
  campus_post: "Campus post",
  dispute: "Dispute",
  review: "Review",
  announcement: "Announcement",
  promotion: "Promotion",
  order: "Order",
  role_permissions: "Role permissions",
  reports: "Reports",
};

export function auditResourceLabel(resource: AuditResource): string {
  return AUDIT_RESOURCE_LABELS[resource] ?? resource;
}

export const AUDIT_RESOURCE_ICONS: Record<AuditResource, LucideIcon> = {
  vendor: Store,
  user: UserRound,
  product: Package,
  category: Tags,
  withdrawal: Landmark,
  platform_setting: Settings,
  campus_post: MessageSquareText,
  dispute: Scale,
  review: Star,
  announcement: Megaphone,
  promotion: Megaphone,
  order: ShoppingBag,
  role_permissions: ShieldCheck,
  reports: BarChart3,
};

export const AUDIT_RESOURCE_FILTER_ORDER: AuditResource[] = [
  "vendor",
  "user",
  "product",
  "category",
  "withdrawal",
  "platform_setting",
  "campus_post",
  "dispute",
  "review",
  "announcement",
  "promotion",
  "order",
  "role_permissions",
  "reports",
];

// ------------------------------------------------------------
// RESULTS
// ------------------------------------------------------------

export const AUDIT_RESULT_LABELS: Record<AuditResult, string> = {
  success: "Success",
  failed: "Failed",
  denied: "Denied",
};

export function auditResultVariant(result: AuditResult): BadgeVariant {
  switch (result) {
    case "success":
      return "success";
    case "failed":
      return "warning";
    default:
      return "error"; // denied
  }
}
