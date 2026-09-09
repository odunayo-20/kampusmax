import {
  ManagedVendor,
  ManagedVendorDetail,
  VendorActivityEvent,
  VendorActivityKind,
  VendorBucket,
  VendorComplaintRow,
  VendorEarningsSummary,
  VendorOrderRow,
  VendorProductRow,
  VendorReviewRow,
  VendorVerificationRecord,
  VendorVerificationStatus,
  VendorStoreLifecycle,
} from "@/types/admin";
import type { Vendor as PlatformVendor } from "@/types";
import { users, vendors as platformVendors } from "@/data/users";
import { storefrontMeta } from "@/data/storefront";
import { products } from "@/data/products";
import { reviews } from "@/data/reviews";
import { mockOrders } from "@/data/orders";
import { vendorOrderSlices } from "@/data/vendor-orders";
import { INITIAL_PAYOUTS } from "@/data/vendor-financials";
import {
  vendorOrders as techHubOrders,
  vendorEarningsSummary as techHubLedger,
  storeProfile as techHubStoreProfile,
} from "@/data/vendor";
import { mockCampuses } from "./campuses";

// ------------------------------------------------------------
// ADMIN VENDOR CONSOLE — derived from the REAL vendor stores.
//
// Every row below is recomputed from the platform's canonical
// seeds (users, storefronts, products, reviews, orders, payouts).
// Nothing is fabricated with PRNGs: vendors without a real ledger
// surface explicit nulls instead of invented numbers. Admin
// actions only persist as an in-memory overlay plus write-through
// cascades to the storefront/vendor records they affect.
// ------------------------------------------------------------

export function bucketOf(
  verificationStatus: VendorVerificationStatus,
  storeStatus: VendorStoreLifecycle
): VendorBucket {
  if (verificationStatus === "pending_verification") return "pending_verification";
  if (verificationStatus === "rejected") return "rejected";
  // Verified vendors fall back to their trading state.
  return storeStatus === "active"
    ? "verified"
    : storeStatus === "suspended"
      ? "suspended"
      : "deactivated";
}

// ------------------------------------------------------------
// IN-SESSION ADMIN OVERLAY (mutations ride on top of real data)
// ------------------------------------------------------------

interface VendorAdminOverlay {
  verificationStatus?: VendorVerificationStatus;
  storeStatus?: VendorStoreLifecycle;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string | null;
}

const overlays: Record<string, VendorAdminOverlay> = {};
const adminLog: Record<string, VendorActivityEvent[]> = {};
let adminEventSeq = 0;

// Snapshot pristine source state so tests can restore a baseline.
const pristineStorefront: Record<
  string,
  { verificationStatus: string; availabilityStatus: string }
> = {};
for (const [vendorId, meta] of Object.entries(storefrontMeta)) {
  pristineStorefront[vendorId] = {
    verificationStatus: meta.verificationStatus,
    availabilityStatus: meta.availabilityStatus,
  };
}
const pristineVendorVerified = new Map<string, boolean>(
  platformVendors.map((v) => [v.id, v.verified])
);

function pushAdminEvent(
  vendorId: string,
  message: string,
  meta: string,
  at: string
): void {
  adminLog[vendorId] = adminLog[vendorId] ?? [];
  adminLog[vendorId].unshift({
    id: `vact-${vendorId}-admin-${++adminEventSeq}`,
    kind: "admin",
    message,
    meta,
    at,
  });
}

export function applyVerificationVerdict(
  vendorId: string,
  status: VendorVerificationStatus,
  reviewer: string,
  reason?: string
): void {
  const now = new Date().toISOString();
  const overlay: VendorAdminOverlay = {
    ...overlays[vendorId],
    verificationStatus: status,
    reviewedAt: now,
    reviewedBy: reviewer,
    rejectionReason: status === "rejected" ? (reason ?? null) : null,
  };
  if (status === "rejected") overlay.storeStatus = "deactivated";
  overlays[vendorId] = overlay;

  const accepted = status === "verified";
  const storefront = storefrontMeta[vendorId];
  if (storefront) storefront.verificationStatus = accepted ? "verified" : "unverified";
  const platformVendor = platformVendors.find((v) => v.id === vendorId);
  if (platformVendor) platformVendor.verified = accepted;

  pushAdminEvent(
    vendorId,
    accepted
      ? `Verification approved by ${reviewer} · storefront is live`
      : `Verification rejected by ${reviewer}${reason ? ` · ${reason}` : ""}`,
    "Verification",
    now
  );
}

export function applyStoreVerdict(
  vendorId: string,
  lifecycle: VendorStoreLifecycle
): void {
  const now = new Date().toISOString();
  overlays[vendorId] = { ...overlays[vendorId], storeStatus: lifecycle };

  const storefront = storefrontMeta[vendorId];
  if (storefront) {
    storefront.availabilityStatus =
      lifecycle === "active"
        ? "active"
        : lifecycle === "suspended"
          ? "suspended"
          : "closed";
  }

  const message =
    lifecycle === "suspended"
      ? "Store suspended · listings hidden from buyers"
      : lifecycle === "active"
        ? "Store re-activated · trading resumed"
        : "Store deactivated by platform admin";
  pushAdminEvent(vendorId, message, "Admin console", now);
}

export function resetVendorAdminState(): void {
  for (const overlay of Object.values(overlays)) {
    for (const key of Object.keys(overlay)) delete (overlay as Record<string, unknown>)[key];
  }
  for (const vendorId of Object.keys(adminLog)) delete adminLog[vendorId];
  adminEventSeq = 0;
  for (const [vendorId, meta] of Object.entries(pristineStorefront)) {
    const storefront = storefrontMeta[vendorId];
    if (storefront) {
      storefront.verificationStatus = meta.verificationStatus as never;
      storefront.availabilityStatus = meta.availabilityStatus as never;
    }
  }
  for (const [vendorId, verified] of pristineVendorVerified) {
    const platformVendor = platformVendors.find((v) => v.id === vendorId);
    if (platformVendor) platformVendor.verified = verified;
  }
}

// ------------------------------------------------------------
// STATE MAPPERS
// ------------------------------------------------------------

function verificationStatusOf(vendorId: string): VendorVerificationStatus {
  const overlayStatus = overlays[vendorId]?.verificationStatus;
  if (overlayStatus) return overlayStatus;
  const storefront = storefrontMeta[vendorId];
  if (storefront) {
    if (storefront.verificationStatus === "verified") return "verified";
    if (storefront.verificationStatus === "restricted") return "rejected";
    return "pending_verification";
  }
  return platformVendors.find((v) => v.id === vendorId)?.verified
    ? "verified"
    : "pending_verification";
}

function storeStatusOf(vendorId: string): VendorStoreLifecycle {
  const overlayStatus = overlays[vendorId]?.storeStatus;
  if (overlayStatus) return overlayStatus;
  const storefront = storefrontMeta[vendorId];
  if (!storefront) return "active";
  if (storefront.availabilityStatus === "suspended") return "suspended";
  if (storefront.availabilityStatus === "active") return "active";
  return "deactivated";
}

// ------------------------------------------------------------
// STATUS MAPPINGS (source -> admin console vocabulary)
// ------------------------------------------------------------

function toAdminOrderStatus(status: string): VendorOrderRow["status"] {
  switch (status) {
    case "pending":
      return "placed";
    case "accepted":
    case "confirmed":
      return "confirmed";
    case "processing":
    case "preparing":
      return "preparing";
    case "ready":
    case "ready_for_pickup":
    case "shipped":
    case "out_for_delivery":
      return "out_for_delivery";
    case "delivered":
    case "completed":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return "placed";
  }
}

function toPaymentStatus(status: string): VendorOrderRow["paymentStatus"] {
  switch (status) {
    case "paid":
      return "paid";
    case "failed":
      return "failed";
    case "refunded":
      return "refunded";
    default:
      return "pending";
  }
}

const DELIVERED_KINDS = new Set(["delivered", "completed"]);

// ------------------------------------------------------------
// KANPONIC LOOKUPS
// ------------------------------------------------------------

function userName(userId: string): string {
  return users.find((u) => u.id === userId)?.name ?? "Student customer";
}

function productTitle(productId: string): string {
  return products.find((p) => p.id === productId)?.title ?? productId;
}

// ------------------------------------------------------------
// ORDER BANK (per vendor, from real order records)
// ------------------------------------------------------------

function techHubRows(): VendorOrderRow[] {
  return techHubOrders.map((row) => ({
    id: row.id,
    customerName: row.buyerName,
    itemsSummary: row.items
      .map((i) => `${i.quantity}\u00d7 ${i.productTitle}`)
      .join(", "),
    itemsCount: row.items.reduce((sum, i) => sum + i.quantity, 0),
    total: row.subtotal,
    status: toAdminOrderStatus(row.status),
    paymentStatus: toPaymentStatus(row.paymentStatus),
    createdAt: row.createdAt,
  }));
}

function sliceRows(vendorId: string): VendorOrderRow[] {
  return vendorOrderSlices
    .filter((slice) => slice.vendorId === vendorId)
    .map((slice) => ({
      id: slice.id,
      customerName: slice.customer.displayName,
      itemsSummary: slice.items
        .map((i) => `${i.quantity}\u00d7 ${i.title}`)
        .join(", "),
      itemsCount: slice.items.reduce((sum, i) => sum + i.quantity, 0),
      total: slice.totals.customerTotal,
      status: toAdminOrderStatus(slice.fulfillmentStatus),
      paymentStatus: toPaymentStatus(slice.paymentStatus),
      createdAt: slice.createdAt,
    }));
}

function marketplaceRows(vendorId: string): VendorOrderRow[] {
  return mockOrders
    .filter((order) => order.vendorId === vendorId)
    .map((order) => ({
      id: order.id,
      customerName: userName(order.buyerId),
      itemsSummary: order.items
        .map((i) => `${i.quantity}\u00d7 ${i.product.title}`)
        .join(", "),
      itemsCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
      total: order.total,
      status: toAdminOrderStatus(order.status),
      paymentStatus: toPaymentStatus(order.paymentStatus),
      createdAt: order.createdAt,
    }));
}

function orderRowsFor(vendorId: string): VendorOrderRow[] {
  if (vendorId === "v1") return techHubRows();
  if (vendorId === "v2" || vendorId === "v8") return sliceRows(vendorId);
  if (vendorId === "v3") return marketplaceRows(vendorId);
  return [];
}

/** Share of rows fulfilled (delivered/completed), rounded to whole percent. */
function fulfilmentShareOf(rows: VendorOrderRow[]): number | null {
  if (rows.length === 0) return null;
  const delivered = rows.filter((r) => r.status === "delivered").length;
  return Math.round((delivered / rows.length) * 100);
}

// ------------------------------------------------------------
// EARNINGS (per vendor, from real ledgers)
// ------------------------------------------------------------

function sliceLedger(vendorId: string): {
  gross: number;
  fees: number;
  net: number;
} {
  const slices = vendorOrderSlices.filter((s) => s.vendorId === vendorId);
  return slices.reduce(
    (acc, s) => ({
      gross: acc.gross + s.totals.itemsSubtotal,
      fees: acc.fees + s.totals.platformFee,
      net: acc.net + s.totals.vendorSubtotal,
    }),
    { gross: 0, fees: 0, net: 0 }
  );
}

function marketplaceLedger(vendorId: string): {
  gross: number;
  fees: number;
  net: number;
} {
  const rows = mockOrders.filter((o) => o.vendorId === vendorId);
  return rows.reduce(
    (acc, o) => ({
      gross: acc.gross + o.subtotal,
      fees: acc.fees + o.platformFee,
      net: acc.net + o.subtotal - o.platformFee,
    }),
    { gross: 0, fees: 0, net: 0 }
  );
}

function earningsFor(vendorId: string): VendorEarningsSummary {
  if (vendorId === "v1") {
    const { totalRevenue, totalEarning, platformFees, pendingPayout } = techHubLedger;
    return {
      grossSales: totalRevenue,
      commissionRate:
        totalRevenue > 0 ? Math.round((platformFees / totalRevenue) * 10000) / 10000 : 0,
      commissionPaid: platformFees,
      netEarnings: totalEarning,
      pendingPayout,
      lastPayoutAt: null,
    };
  }

  if (vendorId === "v2" || vendorId === "v8") {
    const { gross, fees, net } = sliceLedger(vendorId);
    const payout = vendorId === "v8" ? INITIAL_PAYOUTS : [];
    const pendingPayout = payout
      .filter((p) => p.status === "processing")
      .reduce((sum, p) => sum + p.amount, 0);
    const lastPayoutAt =
      payout
        .filter((p) => p.status === "successful" && p.processedAt)
        .map((p) => p.processedAt as string)
        .sort()
        .at(-1) ?? null;
    return {
      grossSales: gross > 0 ? gross : null,
      commissionRate: gross > 0 ? Math.round((fees / gross) * 10000) / 10000 : 0,
      commissionPaid: gross > 0 ? fees : null,
      netEarnings: gross > 0 ? net : null,
      pendingPayout: gross > 0 ? pendingPayout : null,
      lastPayoutAt,
    };
  }

  if (vendorId === "v3") {
    const { gross, fees, net } = marketplaceLedger(vendorId);
    return {
      grossSales: gross > 0 ? gross : null,
      commissionRate: gross > 0 ? Math.round((fees / gross) * 10000) / 10000 : 0,
      commissionPaid: gross > 0 ? fees : null,
      netEarnings: gross > 0 ? net : null,
      pendingPayout: gross > 0 ? 0 : null,
      lastPayoutAt: null,
    };
  }

  return {
    grossSales: null,
    commissionRate: 0,
    commissionPaid: null,
    netEarnings: null,
    pendingPayout: null,
    lastPayoutAt: null,
  };
}

function gmvFor(vendorId: string, earnings: VendorEarningsSummary): number | null {
  if (vendorId === "v1") return techHubLedger.totalRevenue;
  return earnings.grossSales;
}

// ------------------------------------------------------------
// PER-VENDOR DETAIL BUILDERS
// ------------------------------------------------------------

function reviewRowsFor(seed: PlatformVendor): VendorReviewRow[] {
  return reviews
    .filter((r) => r.vendorId === seed.id)
    .map((r) => ({
      id: r.id,
      customerName: userName(r.userId),
      targetName: r.target === "vendor" ? seed.storeName : productTitle(r.productId ?? r.targetId),
      rating: r.rating,
      comment: r.comment,
      status: "published" as const,
      createdAt: r.createdAt,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function productRowsFor(vendorId: string): VendorProductRow[] {
  return products
    .filter((p) => p.vendorId === vendorId)
    .map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      stock: p.stock ?? null,
      status: p.status,
      soldCount: p.soldCount ?? null,
      createdAt: p.createdAt,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function buildActivity(
  seed: PlatformVendor,
  timelineRows: Array<{ at: string; kind: VendorActivityKind; message: string; meta: string }>
): VendorActivityEvent[] {
  const events: VendorActivityEvent[] = [];
  let seq = 0;
  const push = (
    at: string,
    kind: VendorActivityKind,
    message: string,
    meta: string
  ) => {
    events.push({
      id: `vact-${seed.id}-${++seq}`,
      kind,
      message,
      meta,
      at,
    });
  };

  const overlay = overlays[seed.id];
  if (overlay?.reviewedAt) {
    push(
      overlay.reviewedAt,
      "admin",
      overlay.verificationStatus === "verified"
        ? `Verification approved by ${overlay.reviewedBy ?? "Platform Admin"}`
        : `Verification rejected by ${overlay.reviewedBy ?? "Platform Admin"}${overlay.rejectionReason ? ` · ${overlay.rejectionReason}` : ""}`,
      "Verification"
    );
  }

  for (const row of timelineRows) push(row.at, row.kind, row.message, row.meta);
  for (const log of adminLog[seed.id] ?? []) push(log.at, log.kind, log.message, log.meta);

  return events.sort(
    (a, b) => b.at.localeCompare(a.at) || a.id.localeCompare(b.id)
  );
}

function buildDetail(seed: PlatformVendor): ManagedVendorDetail {
  const owner = users.find((u) => u.id === seed.userId);
  const campus = mockCampuses.find((c) => c.id === seed.campusId) ?? null;

  const orderRows = orderRowsFor(seed.id);
  const reviewRows = reviewRowsFor(seed);
  const catalogRows = productRowsFor(seed.id);
  const earnings = earningsFor(seed.id);
  const verificationStatus = verificationStatusOf(seed.id);
  const storeStatus = storeStatusOf(seed.id);
  const overlay = overlays[seed.id];

  const buyerOrders = mockOrders.filter((o) => o.buyerId === seed.userId);
  const ownerOrders: ManagedVendor["owner"]["ordersCount"] = buyerOrders.length;
  const ownerSpent = buyerOrders.reduce((sum, o) => sum + o.total, 0);

  const registeredAt =
    seed.joinDate ??
    (seed.id === "v1" ? techHubStoreProfile?.createdAt : undefined) ??
    owner?.joinedDate ??
    "";

  const activityRows: Array<{
    at: string;
    kind: VendorActivityKind;
    message: string;
    meta: string;
  }> = [];

  orderRows.forEach((row) => {
    activityRows.push({
      at: row.createdAt,
      kind: "order",
      message: `Order ${row.id} ${row.status} · ${row.itemsCount} item(s)`,
      meta: row.status === "delivered" ? "Fulfilment" : "Commerce",
    });
  });
  catalogRows.forEach((row) => {
    activityRows.push({
      at: row.createdAt,
      kind: "product",
      message: `Listed “${row.title}”`,
      meta: "Catalog",
    });
  });
  reviewRows.forEach((row) => {
    activityRows.push({
      at: row.createdAt,
      kind: "order",
      message: `Rated ${row.rating}/5 on ${row.targetName}`,
      meta: "Reviews",
    });
  });
  if (seed.id === "v8") {
    INITIAL_PAYOUTS.forEach((payout) => {
      activityRows.push({
        at: payout.processedAt ?? payout.requestedAt,
        kind: "wallet",
        message: `Payout ${payout.id} ${payout.status} · ₦${payout.amount}`,
        meta: "Finance",
      });
    });
  }
  if (registeredAt) {
    activityRows.push({
      at: registeredAt,
      kind: "auth",
      message: `Store “${seed.storeName}” registered`,
      meta: "Onboarding",
    });
  }

  const activity = buildActivity(seed, activityRows);

  const lastActiveCandidate = activityRows
    .map((row) => row.at)
    .concat(overlay?.reviewedAt ? [overlay.reviewedAt] : [])
    .concat(registeredAt ? [registeredAt] : [])
    .sort()
    .at(-1);
  const lastActiveAt =
    lastActiveCandidate ?? owner?.joinedDate ?? seed.joinDate ?? "";

  const vendor: ManagedVendor = {
    id: seed.id,
    storeName: seed.storeName,
    ownerId: seed.userId,
    owner: {
      id: seed.userId,
      name: owner?.name ?? "Vendor owner",
      email: owner?.email ?? "",
      phone: owner?.phone ?? "",
      isIdVerified: owner?.isVerified === true,
      joinedAt: owner?.joinedDate ?? seed.joinDate ?? "",
      ordersCount: ownerOrders,
      totalSpent: ownerSpent,
    },
    campusId: seed.campusId,
    category: seed.specialties[0] ?? "General",
    description: seed.description,
    verificationStatus,
    storeStatus,
    verification: buildVerificationRecord(seed, verificationStatus, overlay),
    productsCount: catalogRows.length,
    ordersCount: orderRows.length,
    totalSales: gmvFor(seed.id, earnings),
    earnings: earnings.netEarnings ?? 0,
    walletBalance: 0,
    fulfillmentRate: fulfilmentShareOf(orderRows),
    rating: seed.rating,
    reviewsCount: reviewRows.length,
    complaintsCount: 0,
    registeredAt,
    lastActiveAt,
  };

  return {
    vendor,
    campus,
    earnings,
    products: catalogRows,
    orders: orderRows,
    reviews: reviewRows,
    complaints: [] as VendorComplaintRow[],
    activity,
  };
}

function buildVerificationRecord(
  seed: PlatformVendor,
  status: VendorVerificationStatus,
  overlay?: VendorAdminOverlay
): VendorVerificationRecord {
  const verified = status === "verified";
  return {
    emailVerified: verified,
    phoneVerified: verified,
    bvnVerified: false,
    documents: [],
    submittedAt: null,
    reviewedAt: overlay?.reviewedAt ?? null,
    reviewedBy: overlay?.reviewedBy ?? null,
    rejectionReason: overlay?.rejectionReason ?? null,
  };
}

export interface ManagedVendorDataset {
  vendors: ManagedVendor[];
  details: Map<string, ManagedVendorDetail>;
}

export function buildManagedVendorDataset(): ManagedVendorDataset {
  const vendors: ManagedVendor[] = [];
  const details = new Map<string, ManagedVendorDetail>();
  platformVendors.forEach((seed) => {
    const detail = buildDetail(seed);
    vendors.push(detail.vendor);
    details.set(seed.id, detail);
  });
  return { vendors, details };
}