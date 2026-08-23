import {
  ManagedUser,
  ManagedUserDetail,
  ManagedUserRole,
  ManagedUserStatus,
  ManagedVendorProfile,
  UserActivityEvent,
  UserProfileReport,
} from "@/types/admin";
import { mockCampuses } from "./campuses";
import { USER_NAME_POOL } from "./people";
import {
  daysAgoIso,
  intBetween,
  pick,
  seededRandom,
  apiDelay,
} from "@/lib/admin/api";

// ------------------------------------------------------------
// MOCK DATASET FOR THE /admin/users MODULE
//
// Deterministic (seeded PRNG) so every reload renders identical
// data. The service layer owns mutations; these builders only run
// once at module init.
// ------------------------------------------------------------

const ACTIVE_CAMPUSES = mockCampuses.filter((c) => c.status === "active");

const STORE_PREFIXES = [
  "CampusKart", "BookNest", "GlowStudio", "QuickPrint", "SnackCrate",
  "ThreadHaus", "GadgetDock", "RoomFit", "FreshFare", "PixelPoint",
] as const;

const STORE_SUFFIXES = ["Hub", "NG", "Store", "Plug"] as const;

const VENDOR_CATEGORIES = [
  "Electronics",
  "Books & Academic",
  "Fashion",
  "Groceries",
  "Beauty & Personal Care",
  "Home & Living",
  "Printing Services",
] as const;

/** Weighted role plan - guarantees coverage of every role/status pair. */
const ROLE_PLAN: ManagedUserRole[] = [
  // 40 customers
  ...Array<ManagedUserRole>(40).fill("customer"),
  // 16 vendors
  ...Array<ManagedUserRole>(16).fill("vendor"),
  // 6 campus admins
  ...Array<ManagedUserRole>(6).fill("campus_admin"),
  // 3 admins
  ...Array<ManagedUserRole>(3).fill("admin"),
  // 2 super admins
  ...Array<ManagedUserRole>(2).fill("super_admin"),
];

function rollStatus(rand: () => number, i: number): ManagedUserStatus {
  // Force one pending_verification early so the status is visible
  // on the first page without filtering.
  if (i === 1) return "pending_verification";
  if (i === 4) return "suspended";
  if (i === 9) return "deactivated";
  const roll = rand();
  if (roll > 0.92) return "deactivated";
  if (roll > 0.82) return "suspended";
  if (roll > 0.72) return "pending_verification";
  return "active";
}

function makeEmail(name: string, rand: () => number): string {
  const slug = name.toLowerCase().replace(/\s+/g, ".");
  const domains = ["gmail.com", "yahoo.com", "student.edu.ng", "outlook.com"];
  return `${slug}@${pick(rand, domains)}`;
}

function makePhone(rand: () => number): string {
  return `+234 8${intBetween(rand, 0, 9)}${intBetween(rand, 10000000, 99999999)}`;
}

export interface ManagedUserDataset {
  users: ManagedUser[];
  details: Map<string, ManagedUserDetail>;
}

export function buildManagedUserDataset(count = 67): ManagedUserDataset {
  const rand = seededRandom(2026);
  const { FIRST_NAMES, LAST_NAMES } = USER_NAME_POOL;
  const users: ManagedUser[] = [];
  const details = new Map<string, ManagedUserDetail>();

  for (let i = 0; i < count; i++) {
    const role = ROLE_PLAN[i % ROLE_PLAN.length];
    const name = `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`;
    const joinedDaysAgo = intBetween(rand, 3, 480);
    const campus = pick(rand, ACTIVE_CAMPUSES);
    const id = `usr-${String(i + 1).padStart(3, "0")}`;

    let vendorProfile: ManagedVendorProfile | null = null;
    if (role === "vendor") {
      const storeName = `${STORE_PREFIXES[intBetween(rand, 0, STORE_PREFIXES.length - 1)]} ${STORE_SUFFIXES[intBetween(rand, 0, STORE_SUFFIXES.length - 1)]}`;
      vendorProfile = {
        storeName,
        category: pick(rand, VENDOR_CATEGORIES),
        status: rand() > 0.85 ? "pending" : rand() > 0.12 ? "approved" : "suspended",
        rating: Math.round((3.1 + rand() * 1.9) * 10) / 10,
        reviewsCount: intBetween(rand, 4, 240),
        productsCount: intBetween(rand, 3, 74),
        totalSales: intBetween(rand, 30, 1100) * 2500,
        fulfillmentRate: intBetween(rand, 70, 99),
      };
    }

    const ordersCount =
      role === "customer" || role === "vendor" ? intBetween(rand, 0, 82) : 0;
    const disputeRoll = rand();
    const reportsRoll = rand();

    const user: ManagedUser = {
      id,
      name,
      email: makeEmail(name, rand),
      phone: makePhone(rand),
      role,
      campusId: campus.id,
      status: rollStatus(rand, i),
      isVerified: rand() > 0.15,
      joinedAt: daysAgoIso(rand, joinedDaysAgo),
      lastActiveAt: daysAgoIso(rand, intBetween(rand, 0, Math.min(joinedDaysAgo, 42))),
      ordersCount,
      totalSpent: ordersCount * intBetween(rand, 20, 90) * 50,
      walletBalance: intBetween(rand, 0, 160) * 250,
      disputeCount: disputeRoll > 0.88 ? intBetween(rand, 1, 4) : 0,
      reportsCount:
        reportsRoll > 0.86 ? intBetween(rand, 1, 5) : 0,
      vendorProfile,
    };
    users.push(user);
    details.set(id, buildUserDetail(user, rand));
  }

  return { users, details };
}

// ------------------------------------------------------------
// PER-USER DETAIL GENERATORS
// ------------------------------------------------------------

const ORDER_ITEMS = [
  "Textbook pack", "Power bank 20000mAh", "Hoodie", "Weekend groceries box",
  "Wireless earbuds", "Foam mattress 4x6", "Skincare kit", "Photocopy bundle",
  "Sneakers", "Bedding set", "Phone charger 45W", "Laundry detergent",
] as const;

const REPORT_REASONS = [
  "spam", "inappropriate", "scam", "harassment", "counterfeit", "other",
] as const;
const REPORT_DETAILS: Record<string, string> = {
  spam: "Repeated promotional messages sent to unrelated buyers.",
  inappropriate: "Offensive language used toward another student.",
  scam: "Requested off-platform payment before delivery.",
  harassment: "Abusive follow-up messages after a failed negotiation.",
  counterfeit: "Listed branded items with suspiciously low pricing.",
  other: "Miscategorized listing with misleading photos.",
};

function buildUserDetail(
  user: ManagedUser,
  rand: () => number
): ManagedUserDetail {
  const campus = mockCampuses.find((c) => c.id === user.campusId) ?? null;
  return {
    user,
    campus,
    wallet: buildWalletSummary(user, rand),
    orders: buildOrders(user, rand),
    activity: buildActivity(user, rand),
    reports: buildReports(user, rand),
  };
}

function buildWalletSummary(user: ManagedUser, rand: () => number) {
  const balance = user.walletBalance;
  const totalCredited = balance + intBetween(rand, 20, 700) * 250;
  const totalDebited = Math.max(totalCredited - balance, intBetween(rand, 10, 400) * 250);
  return {
    accountId: `wal-${user.id.replace("usr-", "")}`,
    balance,
    totalCredited,
    totalDebited,
    status: (rand() > 0.94 ? "frozen" : "active") as "frozen" | "active",
    lastActivityAt: user.lastActiveAt,
    recentTransactions: Array.from({ length: 5 }).map((_, i) => {
      const direction = rand() > 0.45 ? ("credit" as const) : ("debit" as const);
      return {
        id: `wtx-${user.id}-${i + 1}`,
        direction,
        type: direction === "credit"
          ? pick(rand, ["deposit", "refund", "adjustment"] as const)
          : pick(rand, ["withdrawal", "purchase"] as const),
        amount: intBetween(rand, 4, 220) * 250,
        reference: `WTX-${intBetween(rand, 10000, 99999)}`,
        status: rand() > 0.9 ? ("pending" as const) : ("completed" as const),
        createdAt: daysAgoIso(rand, intBetween(rand, 0, 25)),
      };
    }),
  };
}

function buildOrders(user: ManagedUser, rand: () => number) {
  const count = Math.min(Math.max(Math.round(user.ordersCount / 8), user.ordersCount > 0 ? 3 : 0), 7);
  return Array.from({ length: count }).map((_, i) => {
    const subtotal = intBetween(rand, 8, 420) * 250;
    const deliveryMethod = pick(rand, ["campus_pickup", "meetup", "delivery"] as const);
    const deliveryFee = deliveryMethod === "delivery" ? 500 : 0;
    const itemsCount = intBetween(rand, 1, 5);
    return {
      id: `KMP-${3400 + Number(user.id.split("-")[1]) * 7 + i}`,
      itemsSummary: `${itemsCount}\u00d7 ${pick(rand, ORDER_ITEMS)}`,
      itemsCount,
      total: subtotal + deliveryFee,
      status: pick(rand, [
        "delivered", "delivered", "delivered", "out_for_delivery",
        "confirmed", "placed", "cancelled",
      ] as const),
      paymentMethod: pick(rand, ["paystack", "wallet", "bank_transfer", "cod"] as const),
      paymentStatus: rand() > 0.9 ? ("pending" as const) : ("paid" as const),
      createdAt: daysAgoIso(rand, intBetween(rand, 0, 60)),
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

const ACTIVITY_MESSAGES: Record<
  Exclude<UserActivityEvent["kind"], never>,
  ((u: ManagedUser) => { message: string; meta: string })[]
> = {
  order: [
    () => ({ message: "Placed a new order", meta: "Marketplace" }),
    () => ({ message: "Order delivered and rated 5 stars", meta: "Marketplace" }),
    () => ({ message: "Cancelled an order before preparation started", meta: "Marketplace" }),
  ],
  auth: [
    () => ({ message: "Signed in from a new device", meta: "Android \u00b7 Chrome" }),
    () => ({ message: "Password changed successfully", meta: "Security" }),
    () => ({ message: "Email address verified", meta: "Security" }),
    () => ({ message: "Signed in on web", meta: "Desktop \u00b7 Lagos, NG" }),
  ],
  wallet: [
    () => ({ message: "Wallet funded via Paystack", meta: "Wallet" }),
    () => ({ message: "Refund credited to wallet", meta: "Wallet" }),
    () => ({ message: "Purchase paid from wallet balance", meta: "Wallet" }),
  ],
  listing: [
    (u) => ({
      message: u.vendorProfile
        ? `Published a new listing on ${u.vendorProfile.storeName}`
        : "Saved an item to wishlist",
      meta: u.vendorProfile ? "Catalog" : "Marketplace",
    }),
    (u) => ({
      message: u.vendorProfile
        ? `Updated prices across ${intBetween(seededRandom(u.name.length * 31), 2, 9)} listings`
        : "Reviewed a vendor after delivery",
      meta: u.vendorProfile ? "Catalog" : "Reviews",
    }),
  ],
  moderation: [
    (u) => ({
      message: u.reportsCount > 0 ? "Was reported by another user" : "Reported a listing for review",
      meta: "Moderation",
    }),
    () => ({ message: "Passed an automated account check", meta: "Trust & Safety" }),
  ],
  profile: [
    () => ({ message: "Updated profile photo", meta: "Account" }),
    () => ({ message: "Changed phone number", meta: "Account" }),
    () => ({ message: "Delivery addresses updated", meta: "Account" }),
  ],
  admin: [
    () => ({ message: "Account reviewed by operations", meta: "Admin console" }),
    () => ({ message: "Status changed by platform admin", meta: "Admin console" }),
  ],
};

function buildActivity(user: ManagedUser, rand: () => number): UserActivityEvent[] {
  const kinds: UserActivityEvent["kind"][] = user.role === "vendor"
    ? ["order", "auth", "wallet", "listing", "moderation", "profile"]
    : ["order", "auth", "wallet", "profile"];
  const events: UserActivityEvent[] = [];
  for (let i = 0; i < 12; i++) {
    const kind = pick(rand, kinds);
    const templates = ACTIVITY_MESSAGES[kind];
    const tpl = templates[intBetween(rand, 0, templates.length - 1)](user);
    events.push({
      id: `act-${user.id}-${i + 1}`,
      kind,
      message: tpl.message,
      meta: tpl.meta,
      at: daysAgoIso(rand, intBetween(rand, 0, 30)),
    });
  }
  // Newest first; tie-break deterministically.
  return events.sort(
    (a, b) =>
      new Date(b.at).getTime() - new Date(a.at).getTime() ||
      a.id.localeCompare(b.id)
  );
}

function buildReports(user: ManagedUser, rand: () => number): UserProfileReport[] {
  const reporters = USER_NAME_POOL.FIRST_NAMES;
  return Array.from({ length: user.reportsCount }).map((_, i) => {
    const reason = pick(rand, REPORT_REASONS);
    return {
      id: `rpt-${user.id}-${i + 1}`,
      reason,
      detail: REPORT_DETAILS[reason],
      reporterName: `${reporters[intBetween(rand, 0, reporters.length - 1)]} ${USER_NAME_POOL.LAST_NAMES[intBetween(rand, 0, USER_NAME_POOL.LAST_NAMES.length - 1)]}`,
      status: pick(rand, ["open", "reviewing", "resolved", "dismissed"] as const),
      priority: pick(rand, ["low", "medium", "high"] as const),
      createdAt: daysAgoIso(rand, intBetween(rand, 1, 40)),
    };
  });
}

// ------------------------------------------------------------
// SHARED DELAY HELPER (re-exported for service parity)
// ------------------------------------------------------------

export const userManagementDelay = apiDelay;
