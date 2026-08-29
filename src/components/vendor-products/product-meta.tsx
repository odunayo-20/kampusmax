"use client";

import type { BadgeVariant } from "@/components/admin/StatusBadge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Product } from "@/types";
import {
  ProductPublishStatus,
  ProductStockStatus,
  productPublishStatusLabel,
  productStockStatusLabel,
  productPublishStatusVariant,
  productStockStatusVariant,
  getStockStatus,
} from "@/types/vendor-products";

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

export function productPublishStatusBadgeVariant(status: ProductPublishStatus): BadgeVariant {
  return productPublishStatusVariant(status);
}

export function productStockStatusBadgeVariant(status: ProductStockStatus): BadgeVariant {
  return productStockStatusVariant(status);
}

export function ProductPublishBadge({ status }: { status: ProductPublishStatus }) {
  return (
    <StatusBadge
      variant={productPublishStatusBadgeVariant(status)}
      label={productPublishStatusLabel(status)}
    />
  );
}

export function ProductStockBadge({ status }: { status: ProductStockStatus }) {
  return (
    <StatusBadge
      variant={productStockStatusBadgeVariant(status)}
      label={productStockStatusLabel(status)}
    />
  );
}

export function ProductStockStatusForProduct({ product }: { product: Product }) {
  const stockStatus = getStockStatus(product.stock ?? 0, product.lowStockThreshold ?? 5);
  return <ProductStockBadge status={stockStatus} />;
}

export function getProductDisplayStatus(product: Product): {
  publishStatus: ProductPublishStatus;
  stockStatus: ProductStockStatus;
  availabilityStatus: Product["status"];
} {
  return {
    publishStatus: product.publishedStatus ?? "active",
    stockStatus: getStockStatus(product.stock ?? 0, product.lowStockThreshold ?? 5),
    availabilityStatus: product.status,
  };
}