import {
  AnalyticsCampusRow,
  AnalyticsCategoryRow,
  AnalyticsFilterOptions,
  AnalyticsProductRow,
  AnalyticsQuery,
  AnalyticsReport,
  AnalyticsRange,
  AnalyticsSeriesPoint,
  AnalyticsVendorRow,
} from "@/types/admin";
import { apiDelay, intBetween, seededRandom } from "@/lib/admin/api";
import { buildDailyMetrics } from "@/data/admin/system";
import { mockCategories, mockProducts } from "@/data/admin/catalog";
import { mockVendors } from "@/data/admin/people";
import { getCampusShortName, mockCampuses } from "@/data/admin/campuses";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/reports)
//
// One aggregate endpoint powers the whole console. The mock
// implementation derives every series from a deterministic 365-day
// metrics seed so KPIs, charts and tables reconcile with each
// other exactly like the real warehouse would.
// ------------------------------------------------------------

export interface AdminAnalyticsService {
  getFilterOptions(): Promise<AnalyticsFilterOptions>;
  getReport(query?: AnalyticsQuery): Promise<AnalyticsReport>;
}

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
};

const RANGE_LABELS: Record<AnalyticsRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
};

/** Deterministic campus weight so filters scale all metrics consistently. */
const CAMPUS_WEIGHTS: Record<string, number> = (() => {
  const rand = seededRandom(7331);
  const map: Record<string, number> = {};
  mockCampuses.forEach((c) => {
    map[c.id] = c.status === "active" ? 0.05 + rand() * 0.2 : 0.01;
  });
  return map;
})();

function pctDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function createMockAnalyticsService(): AdminAnalyticsService {
  // Deterministic 365-day seed built once.
  const daily = buildDailyMetrics(365);

  return {
    async getFilterOptions() {
      await apiDelay(60);
      return {
        campuses: mockCampuses.map((c) => ({ id: c.id, name: c.name })),
        vendors: [...mockVendors]
          .sort((a, b) => a.storeName.localeCompare(b.storeName))
          .map((v) => ({ id: v.id, name: v.storeName })),
        categories: mockCategories.map((c) => ({ id: c.id, name: c.name })),
      };
    },

    async getReport(query = {}) {
      await apiDelay();
      const range = query.range ?? "30d";
      const days = RANGE_DAYS[range];
      const { campusId = "all", vendorId = "all", categoryId = "all" } = query;

      // ----- filter weights -----
      const campusWeight = campusId === "all" ? 1 : (CAMPUS_WEIGHTS[campusId] ?? 0.08);
      const selectedVendor =
        vendorId === "all"
          ? null
          : mockVendors.find((v) => v.id === vendorId) ?? null;
      const vendorWeight = selectedVendor
        ? Math.min(1, selectedVendor.totalSales / 900_000)
        : 1;
      const categoryWeight =
        categoryId === "all" ? 1 : 0.04 + ((categoryId.length * 7) % 13) / 40;

      // Marketplace-wide demand scale for the current filter combo.
      const scale = campusWeight * (vendorId === "all" ? 1 : vendorWeight * 3.2) * categoryWeight;

      const current = daily.slice(-days);
      const previous = daily.slice(-days * 2, -days);

      const scoped = current.map((m) => ({
        label: m.label,
        revenue: Math.max(1_000, Math.round(m.revenue * scale)),
        orders: Math.max(1, Math.round(m.orders * scale)),
        signups: Math.max(0, Math.round(m.signups * campusWeight)),
        activeUsers: Math.round((4_200 + m.revenue / 900) * campusWeight),
        newVendors: Math.round(m.vendorSignups * campusWeight),
      }));
      const scopedPrev = previous.map((m) => ({
        revenue: Math.round(m.revenue * scale),
        orders: Math.round(m.orders * scale),
        signups: Math.round(m.signups * campusWeight),
        activeUsers: Math.round((4_200 + m.revenue / 900) * campusWeight),
      }));

      // ----- series shaping (weekly buckets for 12m) -----
      function shape(
        rows: typeof scoped,
        pickValue: (r: (typeof rows)[number]) => number,
        pickSecondary?: (r: (typeof rows)[number]) => number | undefined
      ): AnalyticsSeriesPoint[] {
        if (range !== "12m") {
          return rows.map((r) => ({
            label: r.label,
            value: pickValue(r),
            secondary: pickSecondary?.(r),
          }));
        }
        // Bucket by month label (MMM).
        const buckets = new Map<string, { value: number; secondary: number; order: number }>();
        rows.forEach((r, i) => {
          const monthLabel = r.label.split(" ")[1] ?? r.label;
          const b = buckets.get(monthLabel) ?? {
            value: 0,
            secondary: 0,
            order: buckets.size,
          };
          b.value += pickValue(r);
          if (pickSecondary) b.secondary += pickSecondary(r) ?? 0;
          buckets.set(monthLabel, b);
        });
        return [...buckets.entries()].map(([label, b]) => ({
          label,
          value: b.value,
          secondary: pickSecondary ? b.secondary : undefined,
        }));
      }

      const revenueSeries = shape(scoped, (r) => r.revenue, (r) => r.orders);
      const registrationsSeries = shape(scoped, (r) => r.signups);
      const activeUsersSeries = shape(scoped, (r) => r.activeUsers);
      const newVendorsSeries = shape(scoped, (r) => r.newVendors);
      const aovSeries = shape(
        scoped,
        (r) => (r.orders > 0 ? Math.round(r.revenue / r.orders) : 0)
      );

      // ----- KPIs -----
      const grossSales = scoped.reduce((a, r) => a + r.revenue, 0);
      const orders = scoped.reduce((a, r) => a + r.orders, 0);
      const prevGross = scopedPrev.reduce((a, r) => a + r.revenue, 0);
      const prevOrders = scopedPrev.reduce((a, r) => a + r.orders, 0);
      const prevSignups = scopedPrev.reduce((a, r) => a + r.signups, 0);
      const aov = orders > 0 ? Math.round(grossSales / orders) : 0;
      const prevAov = prevOrders > 0 ? Math.round(prevGross / prevOrders) : 0;
      const activeUsers = Math.round(scoped.reduce((a, r) => a + r.activeUsers, 0) / scoped.length);
      const prevActive = Math.round(
        scopedPrev.reduce((a, r) => a + r.activeUsers, 0) / Math.max(1, scopedPrev.length)
      );
      const newUsers = scoped.reduce((a, r) => a + r.signups, 0);
      const commissionRate = 8;

      // ----- campuses table -----
      const rand = seededRandom(range.length * 977 + campusId.length + 13);
      const activeCampuses = mockCampuses.filter(
        (c) => c.status === "active" && (campusId === "all" || c.id === campusId)
      );
      const totalCampusRevenue = activeCampuses.reduce(
        (a, c) => a + CAMPUS_WEIGHTS[c.id],
        0
      ) || 1;

      const campuses: AnalyticsCampusRow[] = activeCampuses
        .map((c) => {
          const share = CAMPUS_WEIGHTS[c.id] / totalCampusRevenue;
          const rev = Math.round(grossSales * share);
          const ord = Math.max(1, Math.round(orders * share));
          const usersCount = Math.round(c.studentCount * (0.06 + rand() * 0.03));
          return {
            campusId: c.id,
            shortName: c.shortName,
            name: c.name,
            usersCount,
            activeUsers: Math.round(usersCount * (0.6 + rand() * 0.25)),
            newUsers: Math.round(newUsers * share),
            orders: ord,
            revenue: rev,
            vendorsCount: c.activeVendors,
            newVendors: Math.max(
              0,
              Math.round(newVendorsSeries.reduce((a, p) => a + p.value, 0) * share)
            ),
            aov: ord > 0 ? Math.round(rev / ord) : 0,
          };
        })
        .sort((a, b) => b.revenue - a.revenue);

      // ----- vendors table -----
      const vendorPool =
        campusId === "all"
          ? mockVendors.filter((v) => v.status === "approved")
          : mockVendors.filter((v) => v.status === "approved" && v.campusId === campusId);
      const vendors: AnalyticsVendorRow[] = vendorPool
        .map((v) => {
          const weight = Math.min(1.4, v.totalSales / 700_000) * (0.75 + rand() * 0.5);
          const rev = Math.round(grossSales * weight * (selectedVendor?.id === v.id ? 0.95 : 0.14));
          const ord = Math.max(1, Math.round(rev / Math.max(aov || 6800, 2500)));
          return {
            vendorId: v.id,
            storeName: v.storeName,
            campusShortName: getCampusShortName(v.campusId),
            category: v.category,
            orders: ord,
            revenue: rev,
            aov: ord > 0 ? Math.round(rev / ord) : 0,
            rating: Math.round(v.rating * 10) / 10,
            fulfillmentRate: v.fulfillmentRate,
            disputeRate: Math.round((100 - v.fulfillmentRate) * (0.4 + rand() * 0.5) * 10) / 10,
            isNew: rand() > 0.85,
            joinedAt: v.joinedAt,
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, vendorId === "all" ? 12 : 1);

      // ----- top products -----
      const productPool = mockProducts.filter(
        (p) =>
          (campusId === "all" || p.campusId === campusId) &&
          (categoryId === "all" || p.categoryId === categoryId)
      );
      const topProducts: AnalyticsProductRow[] = [...productPool]
        .sort((a, b) => b.saves * 12 + b.views - (a.saves * 12 + a.views))
        .slice(0, 10)
        .map((p) => {
          const unitsSold = Math.max(
            1,
            Math.round(intBetween(rand, 18, 240) * scale * 2)
          );
          return {
            productId: p.id,
            title: p.title,
            vendorName: p.vendorName,
            campusShortName: getCampusShortName(p.campusId),
            category: p.categoryName,
            unitsSold,
            revenue: unitsSold * p.price,
          };
        })
        .sort((a, b) => b.revenue - a.revenue);

      // ----- categories -----
      const catMap = new Map<string, AnalyticsCategoryRow>();
      productPool.forEach((p) => {
        const key = p.categoryId;
        const row = catMap.get(key) ?? {
          categoryId: key,
          name: p.categoryName,
          orders: 0,
          revenue: 0,
          sharePct: 0,
        };
        const units = Math.max(1, Math.round(intBetween(rand, 10, 120) * scale));
        row.orders += units;
        row.revenue += units * p.price;
        catMap.set(key, row);
      });
      const categories = [...catMap.values()]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8);
      const catTotal = categories.reduce((a, c) => a + c.revenue, 0) || 1;
      categories.forEach(
        (c) => (c.sharePct = Math.round((c.revenue / catTotal) * 100))
      );

      // ----- retention (deterministic per range/campus) -----
      const retentionBase =
        range === "7d" ? 46 : range === "30d" ? 41 : range === "90d" ? 37 : 33;
      const retention = {
        day1: Math.min(85, retentionBase + 22 + ((campusId.length * 3) % 7)),
        day7: Math.min(70, retentionBase + 9 + ((campusId.length * 2) % 5)),
        day30: retentionBase + ((campusId.charCodeAt(0) * 1) % 4),
        returningUsers: Math.round(activeUsers * 0.62),
        churnedUsers: Math.round(activeUsers * 0.38),
      };

      // ----- financials -----
      const refunds = Math.round(grossSales * 0.024);
      const platformFees = Math.round((grossSales - refunds) * (commissionRate / 100));
      const vendorEarnings = grossSales - platformFees - refunds;
      const withdrawalsPaid = Math.round(vendorEarnings * 0.82);
      const financials = {
        grossSales,
        platformFees,
        vendorEarnings,
        refunds,
        refundRate: grossSales > 0 ? Math.round((refunds / grossSales) * 1000) / 10 : 0,
        withdrawalsPaid,
        withdrawalsPending: Math.max(0, vendorEarnings - withdrawalsPaid),
        withdrawalsPendingAmount: Math.max(0, vendorEarnings - withdrawalsPaid),
        commissionRate,
      };

      return {
        range,
        previousRangeLabel: `vs previous ${RANGE_LABELS[range].toLowerCase()}`,
        kpis: {
          grossSales,
          grossSalesDelta: pctDelta(grossSales, prevGross),
          orders,
          ordersDelta: pctDelta(orders, prevOrders),
          aov,
          aovDelta: pctDelta(aov, prevAov),
          activeUsers,
          activeUsersDelta: pctDelta(activeUsers, prevActive),
          newUsers,
          newUsersDelta: pctDelta(newUsers, prevSignups),
          activeVendors: vendorPool.length,
          activeVendorsDelta: pctDelta(
            newVendorsSeries.reduce((a, p) => a + p.value, 0) + vendorPool.length * 0.94,
            vendorPool.length
          ),
          platformFees,
          refunds,
        },
        revenueSeries,
        registrationsSeries,
        activeUsersSeries,
        newVendorsSeries,
        aovSeries,
        campuses,
        vendors,
        topProducts,
        categories,
        retention,
        financials,
      };
    },
  };
}
