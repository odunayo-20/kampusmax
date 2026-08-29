import type {
  ProductCondition,
  ProductPublishStatus,
  ProductVariant,
  ProductVariantGroup,
  ProductVariantOption,
} from "@/types";

export type { ProductPublishStatus };
export type ProductStockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type InventoryAdjustmentType = "add" | "subtract" | "set" | "reserve" | "release";

export type ProductSortField =
  | "newest"
  | "oldest"
  | "title"
  | "price_asc"
  | "price_desc"
  | "stock"
  | "updated";

export interface InventoryMovement {
  id: string;
  productId: string;
  type: InventoryAdjustmentType;
  quantity: number;
  reason: string;
  actorId: string;
  resultingStock: number;
  previousStock: number;
  createdAt: string;
}

export interface ProductPublishResult {
  success: boolean;
  status: ProductPublishStatus;
  reason?: string;
  errors?: Record<string, string>;
}

export interface VendorProductQuery {
  search?: string;
  status?: ProductPublishStatus | "all";
  categoryId?: string;
  stockStatus?: ProductStockStatus | "all";
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSortField;
  page?: number;
  pageSize?: number;
}

export interface VendorProductPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type VendorProductPermissionKey =
  | "products.view"
  | "products.create"
  | "products.edit"
  | "products.publish"
  | "products.archive"
  | "products.delete"
  | "inventory.view"
  | "inventory.adjust";

export type VendorProductsPermissions = Record<VendorProductPermissionKey, boolean>;

export function getDefaultVendorProductsPermissions(): VendorProductsPermissions {
  return {
    "products.view": true,
    "products.create": true,
    "products.edit": true,
    "products.publish": true,
    "products.archive": true,
    "products.delete": true,
    "inventory.view": true,
    "inventory.adjust": true,
  };
}

export const PUBLISH_STATUS_LABELS: Record<ProductPublishStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  active: "Active",
  inactive: "Inactive",
  rejected: "Rejected",
  archived: "Archived",
};

export const STOCK_STATUS_LABELS: Record<ProductStockStatus, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

export function productPublishStatusLabel(status: ProductPublishStatus): string {
  return PUBLISH_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export function productStockStatusLabel(status: ProductStockStatus): string {
  return STOCK_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

export function productPublishStatusVariant(status: ProductPublishStatus): BadgeVariant {
  switch (status) {
    case "active":
      return "success";
    case "pending_review":
      return "info";
    case "draft":
      return "neutral";
    case "inactive":
      return "warning";
    case "rejected":
      return "error";
    case "archived":
      return "neutral";
  }
}

export function productStockStatusVariant(status: ProductStockStatus): BadgeVariant {
  switch (status) {
    case "in_stock":
      return "success";
    case "low_stock":
      return "warning";
    case "out_of_stock":
      return "error";
  }
}

export function getStockStatus(stock: number, threshold: number): ProductStockStatus {
  if (stock === 0) return "out_of_stock";
  if (stock <= threshold) return "low_stock";
  return "in_stock";
}

export function getProductPublishAvailability(status: ProductPublishStatus): {
  canPublish: boolean;
  canUnpublish: boolean;
  canArchive: boolean;
  canRestore: boolean;
  canEdit: boolean;
  canDelete: boolean;
} {
  return {
    canPublish: status === "draft" || status === "rejected" || status === "inactive",
    canUnpublish: status === "active",
    canArchive: status !== "archived" && status !== "pending_review",
    canRestore: status === "archived" || status === "rejected" || status === "inactive",
    canEdit: status !== "archived" && status !== "pending_review",
    canDelete: status === "draft" || status === "rejected" || status === "archived",
  };
}