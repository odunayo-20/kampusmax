import {
  ActivityEvent,
  ActivityFeedItem,
  AdminNotification,
  PlatformSetting,
  RevenuePoint,
  TopVendorRow,
} from "@/types/admin";
import { mockVendors, mockUsers } from "./people";
import { mockOrders } from "./commerce";
import { mockProducts } from "./catalog";
import { mockReports } from "./content";
import { getCampusShortName, mockCampuses } from "./campuses";
import { formatNaira } from "@/lib/utils";
import { daysAgoIso, intBetween, pick, seededRandom } from "@/lib/admin/api";

// ------------------------------------------------------------
// BROADCAST NOTIFICATIONS
// ------------------------------------------------------------

export function buildMockNotifications(count = 10): AdminNotification[] {
  const rand = seededRandom(211);
  const audiences = ["all", "students", "vendors", "campus"] as const;

  const templates: { title: string; body: string }[] = [
    { title: "Detty December Flash Sales", body: "Vendors can now enroll their December flash sale listings. Slots close Friday." },
    { title: "Wallet maintenance window", body: "Wallet transfers will pause for 20 minutes on Sunday 2AM for upgrades." },
    { title: "New campus launch: LASU", body: "Vendor onboarding for Lagos State University opens next week." },
    { title: "Exam season delivery slots", body: "Book hostel delivery slots early - capacity is limited during exams." },
    { title: "Withdrawal schedule update", body: "Payouts now process twice daily at 9AM and 3PM WAT." },
    { title: "Community guidelines refresh", body: "Updated rules for marketplace posts take effect immediately." },
    { title: "Referral program pilot", body: "Students earn ₦200 wallet credit per verified referral on RUGIPO." },
    { title: "Vendor verification deadline", body: "Stores without BVN verification will be paused after August 31." },
    { title: "App update v2.4", body: "Faster search, saved carts and order tracking improvements." },
    { title: "Campus rep recruitment", body: "Applications open for FUTA and AAUA campus ambassadors." },
  ];

  return templates.slice(0, count).map((t, i) => ({
    id: `ntf-${String(i + 1).padStart(3, "0")}`,
    ...t,
    audience: pick(rand, audiences),
    campusId: rand() > 0.6 ? pick(rand, ["rugipo", "futa", "unilag", "ui", "oau"]) : null,
    sentBy: pick(rand, ["Adebayo Ogundimu", "Chiamaka Eze", "Fatima Yusuf"]),
    sentAt: daysAgoIso(rand, i === 0 ? 0 : intBetween(rand, 1, 25)),
    recipients: intBetween(rand, 800, 42000),
    openRate: Math.round((28 + rand() * 44)),
    status: i < 7 ? "sent" : rand() > 0.5 ? "scheduled" : "draft",
  }));
}

export const mockNotifications: AdminNotification[] = buildMockNotifications();

// ------------------------------------------------------------
// PLATFORM SETTINGS
// ------------------------------------------------------------

export const mockSettings: PlatformSetting[] = [
  // general
  { key: "platform_name", label: "Platform name", group: "general", valueType: "text", value: "Kampmax" },
  { key: "support_email", label: "Support email", group: "general", valueType: "text", value: "help@kampmax.ng" },
  { key: "maintenance_mode", label: "Maintenance mode", description: "Show a maintenance screen across the customer app.", group: "general", valueType: "toggle", value: false },
  { key: "default_currency", label: "Currency", group: "general", valueType: "select", value: "NGN", options: [{ label: "Naira (₦)", value: "NGN" }, { label: "USD ($)", value: "USD" }] },
  // commerce
  { key: "commission_rate", label: "Commission rate (%)", description: "Platform cut per completed order.", group: "commerce", valueType: "number", value: 8 },
  { key: "delivery_fee_hostel", label: "Hostel delivery fee (₦)", group: "commerce", valueType: "number", value: 500 },
  { key: "auto_approve_products", label: "Auto-approve new products", description: "Skip manual review for trusted vendors.", group: "moderation", valueType: "toggle", value: false },
  { key: "max_listing_photos", label: "Max photos per listing", group: "commerce", valueType: "number", value: 6 },
  // wallet
  { key: "withdrawal_fee", label: "Withdrawal fee (₦)", group: "wallet", valueType: "number", value: 100 },
  { key: "min_withdrawal", label: "Minimum withdrawal (₦)", group: "wallet", valueType: "number", value: 2000 },
  { key: "payout_schedule", label: "Payout schedule", group: "wallet", valueType: "select", value: "twice_daily", options: [{ label: "Twice daily", value: "twice_daily" }, { label: "Daily", value: "daily" }, { label: "Weekly", value: "weekly" }] },
  { key: "require_bvn_payout", label: "Require BVN for payouts", group: "wallet", valueType: "toggle", value: true },
];

export const SETTING_GROUP_LABELS: Record<PlatformSetting["group"], string> = {
  general: "General",
  commerce: "Commerce",
  wallet: "Wallet & Payouts",
  moderation: "Moderation",
};

// ------------------------------------------------------------
// DASHBOARD ANALYTICS
// ------------------------------------------------------------

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface DailyMetric {
  date: string; // ISO
  label: string; // "Aug 22"
  weekday: string;
  revenue: number;
  orders: number;
  signups: number;
  vendorSignups: number;
}

/**
 * Deterministic 90-day daily metrics with a growth trend and weekend
 * uplift. Powers every financial aggregate and time-series chart so
 * all numbers on the dashboard reconcile with each other.
 */
export function buildDailyMetrics(days = 90): DailyMetric[] {
  const rand = seededRandom(307);
  const metrics: DailyMetric[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const progress = (days - 1 - i) / (days - 1); // 0 → 1 growth factor
    const dow = d.getDay();
    const weekendBoost = dow === 0 || dow === 6 ? 1.4 : dow === 1 ? 0.9 : 1;
    const trendBoost = 0.55 + progress * 0.75;

    const revenue = Math.round(420_000 * trendBoost * weekendBoost * (0.82 + rand() * 0.36));
    const orders = Math.max(12, Math.round(revenue / (6_800 + rand() * 1_400)));
    const signups = Math.max(3, Math.round(28 * trendBoost * weekendBoost * (0.7 + rand() * 0.6)));
    const vendorSignups = rand() > 0.55 ? intBetween(rand, 1, 3) : 0;

    metrics.push({
      date: d.toISOString(),
      label: d.toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
      weekday: WEEKDAY_LABELS[dow],
      revenue,
      orders,
      signups,
      vendorSignups,
    });
  }
  return metrics;
}

export const mockDailyMetrics: DailyMetric[] = buildDailyMetrics(90);

function sumRange(metrics: DailyMetric[], days: number): { revenue: number; orders: number } {
  return metrics.slice(-days).reduce(
    (acc, m) => ({ revenue: acc.revenue + m.revenue, orders: acc.orders + m.orders }),
    { revenue: 0, orders: 0 }
  );
}

export function buildRevenueSeries(metrics: DailyMetric[]): RevenuePoint[] {
  return metrics.map((m) => ({
    label: `${m.weekday} ${m.label.split(" ")[0]}`,
    revenue: m.revenue,
    orders: m.orders,
  }));
}

export const mockRevenueSeries: RevenuePoint[] = buildRevenueSeries(mockDailyMetrics);

export const mockTopVendors: TopVendorRow[] = (() => {
  const rand = seededRandom(353);
  return [...mockVendors]
    .filter((v) => v.status === "approved")
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 6)
    .map((v) => ({
      vendorId: v.id,
      storeName: v.storeName,
      campusShortName: getCampusShortName(v.campusId),
      orders: intBetween(rand, 18, 140),
      revenue: v.totalSales,
      rating: v.rating,
    }));
})();

export interface GrowthSeriesPoint {
  label: string;
  usersTotal: number;
  vendorsTotal: number;
}

/** Weekly cumulative users & vendors over the last 12 weeks. */
export const mockGrowthSeries: GrowthSeriesPoint[] = (() => {
  const rand = seededRandom(409);
  let users = 9_200;
  let vendors = 420;
  const points: GrowthSeriesPoint[] = [
    { label: "W-11", usersTotal: users, vendorsTotal: vendors },
  ];
  for (let w = 10; w >= 0; w--) {
    const weeklyUsers = Math.round(180 * (0.8 + rand() * 0.7));
    const weeklyVendors = intBetween(rand, 8, 26);
    users += weeklyUsers;
    vendors += weeklyVendors;
    points.push({ label: `W-${w}`, usersTotal: users, vendorsTotal: vendors });
  }
  return points;
})();

export const mockActivityFeed: ActivityEvent[] = [
  { id: "act-001", kind: "order", message: "New order KMP-2437 placed with GadgetHub Store", meta: "RUGIPO · ₦45,000", at: daysAgoIso(seededRandom(1), 0) },
  { id: "act-002", kind: "withdrawal", message: "TextbookXpress NG requested a payout of ₦85,000", meta: "Pending review", at: daysAgoIso(seededRandom(2), 0) },
  { id: "act-003", kind: "dispute", message: "Dispute opened: “Order marked delivered but nothing arrived”", meta: "KMP-2429 · Urgent", at: daysAgoIso(seededRandom(3), 0) },
  { id: "act-004", kind: "vendor", message: "FreshMart Express submitted verification documents", meta: "Awaiting approval", at: daysAgoIso(seededRandom(4), 1) },
  { id: "act-005", kind: "report", message: "Product flagged as suspected counterfeit: iPhone 11 128GB", meta: "3 reports", at: daysAgoIso(seededRandom(5), 1) },
  { id: "act-006", kind: "user", message: "42 new student signups across FUTA", meta: "Last 24 hours", at: daysAgoIso(seededRandom(6), 1) },
  { id: "act-007", kind: "order", message: "Order KMP-2431 delivered and reviewed (5★)", meta: "UNILAG · ₦12,500", at: daysAgoIso(seededRandom(7), 2) },
];

// ------------------------------------------------------------
// DASHBOARD LIST SOURCES
// ------------------------------------------------------------

export function buildCampusSales() {
  const active = mockCampuses.filter((c) => c.status === "active");
  const totalRevenue = active.reduce((acc, c) => acc + c.gmvThisMonth, 0);
  return active
    .map((c) => ({
      campusId: c.id,
      shortName: c.shortName,
      orders: c.ordersThisMonth,
      revenue: c.gmvThisMonth,
      sharePct: Math.round((c.gmvThisMonth / totalRevenue) * 100),
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export const mockCampusSales = buildCampusSales();

export function buildTopProducts(limit = 8) {
  const rand = seededRandom(431);
  const ranked = [...mockProducts]
    .filter((p) => p.status === "available" || p.status === "sold")
    .sort((a, b) => b.saves * 12 + b.views - (a.saves * 12 + a.views))
    .slice(0, limit);

  return ranked.map((p) => {
    const unitsSold = intBetween(rand, 18, 240);
    return {
      productId: p.id,
      title: p.title,
      vendorName: p.vendorName,
      campusShortName: getCampusShortName(p.campusId),
      unitsSold,
      revenue: unitsSold * p.price,
    };
  });
}

export const mockTopProducts = buildTopProducts();

export function buildLowStock(limit = 8) {
  return [...mockProducts]
    .filter((p) => p.status === "available")
    .sort((a, b) => a.stock - b.stock)
    .slice(0, limit)
    .map((p) => ({
      productId: p.id,
      title: p.title,
      vendorName: p.vendorName,
      stock: p.stock,
      status: p.status,
    }));
}

export const mockLowStock = buildLowStock();

// ------------------------------------------------------------
// ACTIVITY FEED (dashboard)
// ------------------------------------------------------------

export function buildActivityItems(): ActivityFeedItem[] {
  const rand = seededRandom(577);
  const items: ActivityFeedItem[] = [];

  mockOrders.slice(0, 6).forEach((o) =>
    items.push({
      id: `act-o-${o.id}`,
      kind: "order",
      message: `New order ${o.id} placed with ${o.vendorName}`,
      meta: `${getCampusShortName(o.campusId)} · ${formatNaira(o.total)}`,
      at: o.createdAt,
    })
  );

  for (let i = 0; i < 5; i++) {
    const u = pick(rand, mockUsers);
    items.push({
      id: `act-r-${u.id}-${i}`,
      kind: "registration",
      message: `${u.name} joined as a ${u.kind === "vendor" ? "vendor" : "student"}`,
      meta: getCampusShortName(u.campusId),
      at: u.joinedAt,
    });
  }

  mockVendors
    .filter((v) => v.status === "pending")
    .slice(0, 3)
    .forEach((v) =>
      items.push({
        id: `act-v-${v.id}`,
        kind: "vendor_application",
        message: `${v.storeName} applied to sell on Kampmax`,
        meta: `${getCampusShortName(v.campusId)} · ${v.category}`,
        at: v.joinedAt,
      })
    );

  mockReports.slice(0, 4).forEach((r) =>
    items.push({
      id: `act-rep-${r.id}`,
      kind: "report",
      message: `${r.targetType === "product" ? "Listing" : r.targetType === "user" ? "User" : r.targetType} reported for ${r.reason}: ${r.targetPreview}`,
      meta: `${r.priority.toUpperCase()} priority`,
      at: r.createdAt,
    })
  );

  return items.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
}

export const mockActivityItems: ActivityFeedItem[] = buildActivityItems();
