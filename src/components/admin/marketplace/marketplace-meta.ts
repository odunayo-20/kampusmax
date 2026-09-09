import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  MarketplacePublicationFilter,
  MarketplaceStockFilter,
  MarketplaceVisibility,
  ProductStatusCompat,
} from "@/types/admin";

// ------------------------------------------------------------
// LABELS
// ------------------------------------------------------------

export const LISTING_STATUS_LABELS: Record<ProductStatusCompat, string> = {
  available: "Available",
  sold: "Sold",
  removed: "Removed",
};

export const VISIBILITY_LABELS: Record<MarketplaceVisibility, string> = {
  live: "Live",
  paused_storefront: "Paused storefront",
  storefront_missing: "No storefront",
  unpublished: "Unpublished",
  sold: "Sold",
  removed: "Removed",
};

export const PUBLICATION_LABELS: Record<MarketplacePublicationFilter, string> = {
  all: "All publications",
  draft: "Draft",
  pending_review: "Pending review",
  active: "Active",
  inactive: "Inactive",
  rejected: "Rejected",
  archived: "Archived",
  unset: "Not recorded",
};

export const STOCK_LABELS: Record<MarketplaceStockFilter, string> = {
  all: "All stock",
  in_stock: "In stock",
  out_of_stock: "Out of stock",
  not_tracked: "Not tracked",
};

export const CONDITION_LABELS: Record<string, string> = {
  New: "New",
  Used: "Used",
  Fair: "Fair",
};

/** The status tab axis (All is the traffic-light baseline). */
export const STATUS_TABS: (ProductStatusCompat | "all")[] = [
  "all",
  "available",
  "sold",
  "removed",
];

export const STATUS_TAB_DOTS: Record<ProductStatusCompat, string> = {
  available: "bg-kampmax-success",
  sold: "bg-kampmax-text-secondary/50",
  removed: "bg-kampmax-error",
};

/** Full visibility vocabulary for the select (tabs cover sold/removed). */
export const VISIBILITY_OPTIONS: MarketplaceVisibility[] = [
  "live",
  "paused_storefront",
  "storefront_missing",
  "unpublished",
];
export const VISIBILITY_OPTIONS_ALL: (MarketplaceVisibility | "all")[] = [
  "all",
  ...VISIBILITY_OPTIONS,
];

export const PUBLICATION_KEYS = Object.keys(
  PUBLICATION_LABELS
) as MarketplacePublicationFilter[];

export const STOCK_KEYS = Object.keys(STOCK_LABELS) as MarketplaceStockFilter[];

// ------------------------------------------------------------
// BADGE VARIANTS
// ------------------------------------------------------------

export function statusBadgeVariant(status: ProductStatusCompat): BadgeVariant {
  switch (status) {
    case "available":
      return "success";
    case "sold":
      return "neutral";
    case "removed":
      return "neutral";
  }
}

export function visibilityBadgeVariant(visibility: MarketplaceVisibility): BadgeVariant {
  switch (visibility) {
    case "live":
      return "success";
    case "paused_storefront":
      return "warning";
    case "storefront_missing":
      return "neutral";
    case "unpublished":
      return "info";
    case "sold":
      return "neutral";
    case "removed":
      return "error";
  }
}

export function publicationBadgeVariant(
  publication: MarketplaceListingPublicationValue
): BadgeVariant {
  switch (publication) {
    case "active":
      return "success";
    case "pending_review":
      return "info";
    case "draft":
      return "warning";
    case "inactive":
      return "neutral";
    case "rejected":
      return "error";
    case "archived":
      return "neutral";
    case null:
      return "neutral";
  }
}

export function conditionBadgeVariant(condition: string): BadgeVariant {
  switch (condition) {
    case "New":
      return "blue";
    case "Used":
      return "info";
    case "Fair":
      return "warning";
    default:
      return "neutral";
  }
}

type MarketplaceListingPublicationValue =
  | "draft"
  | "pending_review"
  | "active"
  | "inactive"
  | "rejected"
  | "archived"
  | null;