import type { Review } from "@/types";
import type { VendorOrder } from "@/types/vendor-orders";

// ============================================================
// VENDOR CUSTOMERS DOMAIN  (Module 13)
// ============================================================
//
// A Kampmax USER becomes a vendor CUSTOMER through a per-vendor relationship
// (they placed at least one order with this vendor). The backend derives every
// customer row for a vendor from that vendor's own orders — it never shares
// another seller's relationships, private contact details, or platform-wide
// activity. Ownership is always derived from the authenticated identity.

// ── Segmentation (backend-computed) ─────────────────────────

export const VENDOR_CUSTOMER_SEGMENT = {
  NEW: "new",
  RETURNING: "returning",
  FREQUENT: "frequent",
  INACTIVE: "inactive",
} as const;

export type VendorCustomerSegment = ValuesOf<typeof VENDOR_CUSTOMER_SEGMENT>;

// ── The customer relationship row ───────────────────────────

export interface VendorCustomer {
  buyerId: string;
  displayName: string;
  /** Contact surfaced only when the buyer opted in for fulfillment. */
  email?: string;
  phone?: string;
  campusLabel?: string;
  totalOrders: number;
  completedOrders: number;
  openOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderAt: string;
  lastOrderAt: string;
  lastInteractionAt: string;
  segment: VendorCustomerSegment;
  /** Top products bought from THIS vendor (backend-aggregated). */
  topProducts: { productId: string; title: string; quantity: number }[];
}

// ── Activity feed (backend records; UI never fabricates) ─────

export const VENDOR_CUSTOMER_ACTIVITY = {
  ORDER_PLACED: "order_placed",
  ORDER_COMPLETED: "order_completed",
  ORDER_CANCELLED: "order_cancelled",
  DISPUTE_OPENED: "dispute_opened",
  REVIEW_POSTED: "review_posted",
  NOTE_ADDED: "note_added",
  MESSAGE_SENT: "message_sent",
} as const;

export type VendorCustomerActivityKind = ValuesOf<typeof VENDOR_CUSTOMER_ACTIVITY>;

export interface VendorCustomerActivity {
  id: string;
  kind: VendorCustomerActivityKind;
  title: string;
  detail?: string;
  at: string;
  orderId?: string;
}

// ── Internal notes (NEVER customer-visible) ─────────────────

export interface VendorCustomerNote {
  id: string;
  buyerId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorCustomerDetails {
  customer: VendorCustomer;
  /** Vendor-owned order slices for this buyer only. */
  orders: VendorOrder[];
  /** Reviews this buyer left about this vendor (store or product). */
  reviews: Review[];
  activity: VendorCustomerActivity[];
}

// ── Query / pagination ──────────────────────────────────────

export const VENDOR_CUSTOMER_SORT = {
  RECENT: "recent",
  OLDEST: "oldest",
  NAME: "name",
  HIGHEST_SPEND: "highest_spend",
  MOST_ORDERS: "most_orders",
} as const;

export type VendorCustomerSortField = ValuesOf<typeof VENDOR_CUSTOMER_SORT>;

export interface VendorCustomerQuery {
  search?: string;
  segment?: VendorCustomerSegment | "all";
  sort?: VendorCustomerSortField;
  page?: number;
  pageSize?: number;
}

export interface VendorCustomerPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VendorCustomerCounts {
  all: number;
  new: number;
  returning: number;
  frequent: number;
  inactive: number;
}

// ── Permission model (presentation; backend stays authoritative) ─

export const VENDOR_CUSTOMER_PERMISSION_KEYS = [
  "customers.view",
  "customers.note",
  "customers.message",
] as const;

export type VendorCustomerPermissionKey = (typeof VENDOR_CUSTOMER_PERMISSION_KEYS)[number];
export type VendorCustomerPermissions = Record<VendorCustomerPermissionKey, boolean>;

export function getDefaultVendorCustomerPermissions(): VendorCustomerPermissions {
  return {
    "customers.view": true,
    "customers.note": true,
    "customers.message": true,
  };
}

// ── Mutation result codes (backend-authoritative) ────────────

export type VendorCustomerResultCode =
  | "ok"
  | "not_found"
  | "forbidden"
  | "invalid_payload"
  | "empty";

export interface VendorCustomerResult {
  ok: boolean;
  code: VendorCustomerResultCode;
  error?: string;
  note?: VendorCustomerNote;
}

type ValuesOf<T> = T[keyof T];