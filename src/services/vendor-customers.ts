import { getCurrentUser, getVendorByUserId, getUserById } from "@/services/users";
import { getVendorAccess, getVendorPermissions } from "@/services/vendor-dashboard";
import { VENDOR_DASHBOARD_GATE } from "@/types/vendor-dashboard";
import { listVendorOrders } from "@/services/vendor-orders";
import { getAllReviews } from "@/services/reviews";
import { customerNotesMock } from "@/data/vendor-customers";
import type { VendorOrder, VendorOrderTimelineEvent } from "@/types/vendor-orders";
import type { Review } from "@/types";
import type {
  VendorCustomer,
  VendorCustomerQuery,
  VendorCustomerPage,
  VendorCustomerCounts,
  VendorCustomerDetails,
  VendorCustomerActivity,
  VendorCustomerNote,
  VendorCustomerSegment,
  VendorCustomerResult,
  VendorCustomerPermissionKey,
  VendorCustomerPermissions,
} from "@/types/vendor-customers";
import {
  VENDOR_CUSTOMER_ACTIVITY,
  VENDOR_CUSTOMER_SORT,
} from "@/types/vendor-customers";

// ============================================================
// VENDOR CUSTOMERS SERVICE LAYER  (Module 13)
// ============================================================
//
// Maps 1:1 to a future backend API:
//   GET    /vendor/customers            → derived list (search / filter / page)
//   GET    /vendor/customers/counts     → segment counts
//   GET    /vendor/customers/{buyerId}  → owner-scoped relationship detail
//   GET    /vendor/customers/{buyerId}/notes
//   POST   /vendor/customers/{buyerId}/notes        { body }
//   PATCH  /vendor/customers/notes/{noteId}         { body }
//   DELETE /vendor/customers/notes/{noteId}
//
// Every row is DERIVED from the authenticated vendor's own order slices —
// never from a client-supplied vendorId and never from another seller's
// records. Contact details are surfaced only when the buyer opted in.

// ── Ownership / access ───────────────────────────────────────

function ownerVendorId(): string | null {
  const user = getCurrentUser();
  const vendor = getVendorByUserId(user.id);
  const access = getVendorAccess();
  if (!vendor || !access.canUseDashboard || access.kind !== VENDOR_DASHBOARD_GATE.APPROVED) {
    return null;
  }
  return vendor.id;
}

export function getVendorCustomerPermissions(): VendorCustomerPermissions {
  const base = getVendorPermissions();
  return {
    "customers.view": base.canManageCustomers,
    "customers.note": base.canManageCustomers,
    "customers.message": base.canManageCustomers,
  } satisfies Record<VendorCustomerPermissionKey, boolean>;
}

// ── Derivation (single source: owned order slices) ───────────

interface OrderBucket {
  orders: VendorOrder[];
}

function buildBuckets(): Record<string, OrderBucket> {
  const vendorId = ownerVendorId();
  if (!vendorId) return {};
  const page = listVendorOrders({ pageSize: 100 });
  const buckets: Record<string, OrderBucket> = {};
  for (const order of page.items) {
    if (order.vendorId !== vendorId) continue;
    const key = order.customer.buyerId;
    if (!buckets[key]) buckets[key] = { orders: [] };
    buckets[key].orders.push(order);
  }
  return buckets;
}

function segmentFor(c: { totalOrders: number; lastOrderAt: string; completedOrders: number }): VendorCustomerSegment {
  const now = Date.now();
  const last = new Date(c.lastOrderAt).getTime();
  const daysSinceLast = (now - last) / 86_400_000;
  if (c.totalOrders >= 3) return "frequent";
  if (c.totalOrders === 2) return "returning";
  if (c.totalOrders === 1 && daysSinceLast > 90 && c.completedOrders === 0) return "inactive";
  return "new";
}

function topProductsFor(orders: VendorOrder[]): VendorCustomer["topProducts"] {
  const byProduct = new Map<string, { title: string; quantity: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const existing = byProduct.get(item.productId);
      if (existing) existing.quantity += item.quantity;
      else byProduct.set(item.productId, { title: item.title, quantity: item.quantity });
    }
  }
  return [...byProduct.entries()]
    .map(([productId, v]) => ({ productId, title: v.title, quantity: v.quantity }))
    .sort((a, b) => b.quantity - a.quantity);
}

function toCustomer(key: string, bucket: OrderBucket): VendorCustomer {
  const orders = bucket.orders;
  const first = orders.reduce((a, b) => (new Date(a.createdAt) <= new Date(b.createdAt) ? a : b));
  const last = orders.reduce((a, b) => (new Date(a.createdAt) >= new Date(b.createdAt) ? a : b));
  const completed = orders.filter((o) => o.fulfillmentStatus === "completed" || o.fulfillmentStatus === "delivered").length;
  const open = orders.filter((o) =>
    ["pending", "accepted", "processing", "ready_for_pickup", "shipped", "out_for_delivery"].includes(o.fulfillmentStatus)
  ).length;
  const spent = orders.reduce((sum, o) => sum + o.totals.customerTotal, 0);
  const firstItem = first;
  const lastItem = last;

  const note = customerNotesMock.items
    .filter((n) => n.buyerId === key)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  return {
    buyerId: key,
    displayName: firstItem.customer.displayName,
    phone: firstItem.customer.phone,
    campusLabel: firstItem.customer.campusLabel,
    totalOrders: orders.length,
    completedOrders: completed,
    openOrders: open,
    totalSpent: spent,
    averageOrderValue: orders.length ? Math.round(spent / orders.length) : 0,
    firstOrderAt: firstItem.createdAt,
    lastOrderAt: lastItem.createdAt,
    lastInteractionAt: note && new Date(note.updatedAt) > new Date(lastItem.createdAt) ? note.updatedAt : lastItem.createdAt,
    segment: segmentFor({ totalOrders: orders.length, lastOrderAt: lastItem.createdAt, completedOrders: completed }),
    topProducts: topProductsFor(orders),
  };
}

// ── List / counts ────────────────────────────────────────────

export function listVendorCustomers(query: VendorCustomerQuery = {}): VendorCustomerPage<VendorCustomer> {
  const { search = "", segment = "all", sort = VENDOR_CUSTOMER_SORT.RECENT, page = 1, pageSize = 12 } = query;
  const normPage = Math.max(1, Math.floor(page));
  const normSize = Math.max(1, Math.floor(pageSize));

  let customers = Object.entries(buildBuckets()).map(([key, bucket]) => toCustomer(key, bucket));

  if (segment !== "all") {
    customers = customers.filter((c) => c.segment === segment);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    customers = customers.filter((c) =>
      [c.displayName, c.buyerId, c.campusLabel ?? "", ...c.topProducts.map((t) => t.title)].join(" ").toLowerCase().includes(q)
    );
  }

  if (sort === VENDOR_CUSTOMER_SORT.NAME) customers = [...customers].sort((a, b) => a.displayName.localeCompare(b.displayName));
  else if (sort === VENDOR_CUSTOMER_SORT.HIGHEST_SPEND) customers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);
  else if (sort === VENDOR_CUSTOMER_SORT.MOST_ORDERS) customers = [...customers].sort((a, b) => b.totalOrders - a.totalOrders);
  else if (sort === VENDOR_CUSTOMER_SORT.OLDEST) customers = [...customers].sort((a, b) => new Date(a.lastOrderAt).getTime() - new Date(b.lastOrderAt).getTime());
  else customers = [...customers].sort((a, b) => new Date(b.lastInteractionAt).getTime() - new Date(a.lastInteractionAt).getTime());

  const total = customers.length;
  const totalPages = Math.max(1, Math.ceil(total / normSize));
  const safePage = Math.min(normPage, totalPages);
  const start = (safePage - 1) * normSize;

  return {
    items: customers.slice(start, start + normSize),
    total,
    page: safePage,
    pageSize: normSize,
    totalPages,
  };
}

export function getVendorCustomerCounts(): VendorCustomerCounts {
  const customers = Object.entries(buildBuckets()).map(([key, bucket]) => toCustomer(key, bucket));
  const counts: VendorCustomerCounts = { all: customers.length, new: 0, returning: 0, frequent: 0, inactive: 0 };
  for (const c of customers) {
    if (c.segment === "new") counts.new += 1;
    if (c.segment === "returning") counts.returning += 1;
    if (c.segment === "frequent") counts.frequent += 1;
    if (c.segment === "inactive") counts.inactive += 1;
  }
  return counts;
}

// ── Detail ───────────────────────────────────────────────────

export function getVendorCustomerByBuyerId(buyerId: string): VendorCustomerDetails | null {
  const bucket = buildBuckets()[buyerId];
  if (!bucket) return null;
  const customer = toCustomer(buyerId, bucket);
  const orders = [...bucket.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const reviews = getAllReviews()
    .filter((r) => r.userId === buyerId && r.vendorId && r.vendorId === ownerVendorId())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const notes = getNotesFor(buyerId);
  const activity = buildActivity(buyerId, orders, reviews, notes);
  return { customer, orders, reviews, activity };
}

function getNotesFor(buyerId: string): VendorCustomerNote[] {
  return customerNotesMock.items
    .filter((n) => n.buyerId === buyerId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function mapTimeline(kind: VendorOrderTimelineEvent["kind"]): VendorCustomerActivity["kind"] {
  switch (kind) {
    case "completed":
      return VENDOR_CUSTOMER_ACTIVITY.ORDER_COMPLETED;
    case "cancelled":
      return VENDOR_CUSTOMER_ACTIVITY.ORDER_CANCELLED;
    case "dispute_opened":
      return VENDOR_CUSTOMER_ACTIVITY.DISPUTE_OPENED;
    default:
      return VENDOR_CUSTOMER_ACTIVITY.ORDER_PLACED;
  }
}

function buildActivity(
  buyerId: string,
  orders: VendorOrder[],
  reviews: Review[],
  notes: VendorCustomerNote[]
): VendorCustomerActivity[] {
  const activities: VendorCustomerActivity[] = [];

  for (const order of orders) {
    for (const ev of order.timeline) {
      const kind = mapTimeline(ev.kind);
      if (kind === VENDOR_CUSTOMER_ACTIVITY.ORDER_PLACED && ev.kind !== "placed") continue;
      activities.push({
        id: `act-${order.id}-${ev.id}`,
        kind,
        title: ev.title,
        detail: ev.detail,
        at: ev.at,
        orderId: order.id,
      });
    }
  }

  for (const r of reviews) {
    activities.push({
      id: `act-review-${r.id}`,
      kind: VENDOR_CUSTOMER_ACTIVITY.REVIEW_POSTED,
      title: r.target === "vendor" ? "Left a store review" : `Reviewed ${r.title ?? "a product"}`,
      detail: `Rated ${r.rating}/5`,
      at: r.createdAt,
    });
  }

  for (const n of notes) {
    activities.push({
      id: `act-note-${n.id}`,
      kind: VENDOR_CUSTOMER_ACTIVITY.NOTE_ADDED,
      title: "Vendor added an internal note",
      detail: n.body,
      at: n.updatedAt,
    });
  }

  return activities.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

// ── Notes ────────────────────────────────────────────────────

export function getVendorCustomerNotes(buyerId: string): VendorCustomerNote[] {
  if (!getVendorCustomerByBuyerId(buyerId)) return [];
  return getNotesFor(buyerId);
}

function nowIso(): string {
  return new Date().toISOString();
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function fail(code: VendorCustomerResult["code"], error: string): VendorCustomerResult {
  return { ok: false, code, error };
}

export function addVendorCustomerNote(buyerId: string, body: string): VendorCustomerResult {
  if (!ownerVendorId()) return fail("forbidden", "You don't have an approved vendor account.");
  if (!getVendorCustomerByBuyerId(buyerId)) return fail("not_found", "Customer relationship not found.");
  const trimmed = body.trim();
  if (!trimmed) return fail("invalid_payload", "Note cannot be empty.");
  if (trimmed.length > 400) return fail("invalid_payload", "Note cannot exceed 400 characters.");

  const now = nowIso();
  const note: VendorCustomerNote = {
    id: generateId("vcn"),
    buyerId,
    body: trimmed,
    createdAt: now,
    updatedAt: now,
  };
  customerNotesMock.items.push(note);
  return { ok: true, code: "ok", note };
}

export function updateVendorCustomerNote(noteId: string, body: string): VendorCustomerResult {
  if (!ownerVendorId()) return fail("forbidden", "You don't have an approved vendor account.");
  const note = customerNotesMock.items.find((n) => n.id === noteId);
  if (!note) return fail("not_found", "Note not found.");
  const trimmed = body.trim();
  if (!trimmed) return fail("invalid_payload", "Note cannot be empty.");
  if (trimmed.length > 400) return fail("invalid_payload", "Note cannot exceed 400 characters.");
  note.body = trimmed;
  note.updatedAt = nowIso();
  return { ok: true, code: "ok", note };
}

export function deleteVendorCustomerNote(noteId: string): VendorCustomerResult {
  if (!ownerVendorId()) return fail("forbidden", "You don't have an approved vendor account.");
  const index = customerNotesMock.items.findIndex((n) => n.id === noteId);
  if (index === -1) return fail("not_found", "Note not found.");
  customerNotesMock.items.splice(index, 1);
  return { ok: true, code: "ok" };
}

// ── Display helpers ──────────────────────────────────────────

export function getCustomerUserDisplay(buyerId: string): { name?: string; department?: string } {
  const user = getUserById(buyerId);
  return { name: user?.name, department: user?.department };
}