import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type { VendorCustomerSegment } from "@/types/vendor-customers";
import { VENDOR_CUSTOMER_SORT } from "@/types/vendor-customers";
import type { VendorCustomerSortField } from "@/types/vendor-customers";

export const SEGMENT_LABELS: Record<VendorCustomerSegment, string> = {
  new: "New",
  returning: "Returning",
  frequent: "Frequent",
  inactive: "Inactive",
};

export function customerSegmentLabel(segment: VendorCustomerSegment): string {
  return SEGMENT_LABELS[segment] ?? segment;
}

export function customerSegmentVariant(segment: VendorCustomerSegment): BadgeVariant {
  switch (segment) {
    case "new":
      return "info";
    case "returning":
      return "blue";
    case "frequent":
      return "success";
    case "inactive":
      return "neutral";
  }
}

export const SEGMENT_OPTIONS: { value: VendorCustomerSegment | "all"; label: string }[] = [
  { value: "all", label: "All customers" },
  { value: "new", label: "New" },
  { value: "returning", label: "Returning" },
  { value: "frequent", label: "Frequent" },
  { value: "inactive", label: "Inactive" },
];

export const CUSTOMER_SORT_OPTIONS: { value: VendorCustomerSortField; label: string }[] = [
  { value: VENDOR_CUSTOMER_SORT.RECENT, label: "Recently active" },
  { value: VENDOR_CUSTOMER_SORT.OLDEST, label: "Oldest" },
  { value: VENDOR_CUSTOMER_SORT.NAME, label: "Name" },
  { value: VENDOR_CUSTOMER_SORT.HIGHEST_SPEND, label: "Highest spend" },
  { value: VENDOR_CUSTOMER_SORT.MOST_ORDERS, label: "Most orders" },
];

export const SEGMENT_PILLS: { value: VendorCustomerSegment | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "returning", label: "Returning" },
  { value: "frequent", label: "Frequent" },
  { value: "inactive", label: "Inactive" },
];