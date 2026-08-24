import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  ManagedProduct,
  ProductActivityKind,
} from "@/types/admin";

// ------------------------------------------------------------
// LABELS
// ------------------------------------------------------------

export const PRODUCT_STATUS_LABELS: Record<ManagedProduct["status"], string> = {
  active: "Active",
  pending_approval: "Pending approval",
  rejected: "Rejected",
  out_of_stock: "Out of stock",
  suspended: "Suspended",
  archived: "Archived",
};

export const PRODUCT_ACTIVITY_LABELS: Record<ProductActivityKind, string> = {
  listing: "Catalog",
  order: "Commerce",
  moderation: "Trust & Safety",
  admin: "Admin actions",
  pricing: "Pricing",
};

export function productStatusLabel(status: ManagedProduct["status"]): string {
  return PRODUCT_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

// ------------------------------------------------------------
// BADGE VARIANTS
// ------------------------------------------------------------

export function productManagementStatusVariant(
  status: ManagedProduct["status"]
): BadgeVariant {
  switch (status) {
    case "active":
      return "success";
    case "pending_approval":
      return "info";
    case "rejected":
      return "error";
    case "out_of_stock":
      return "warning";
    case "suspended":
      return "error";
    case "archived":
      return "neutral";
  }
}

export function stockTone(stock: number): "success" | "warning" | "error" {
  if (stock === 0) return "error";
  if (stock <= 5) return "warning";
  return "success";
}

// ------------------------------------------------------------
// ACTION AVAILABILITY (mirrors future API-side policy)
// ------------------------------------------------------------

export interface ProductActionAvailability {
  canApprove: boolean;
  canReject: boolean;
  canSuspend: boolean;
  canArchive: boolean;
  canRestore: boolean;
}

export function getProductActionAvailability(
  status: ManagedProduct["status"]
): ProductActionAvailability {
  return {
    canApprove: status === "pending_approval",
    canReject: status === "pending_approval",
    canSuspend: status === "active" || status === "out_of_stock",
    canArchive:
      status !== "archived" && status !== "pending_approval",
    canRestore:
      status === "archived" ||
      status === "suspended" ||
      status === "rejected" ||
      status === "out_of_stock",
  };
}
