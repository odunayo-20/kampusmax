import {
  ActivityFeedItem,
  AdminOrder,
  CampusSalesRow,
  DashboardStats,
  GrowthPoint,
  ListQuery,
  LowStockRow,
  Paginated,
  PlatformOverview,
  RevenuePoint,
  TopProductRow,
  TopVendorRow,
} from "@/types/admin";
import { apiDelay } from "@/lib/admin/api";
import {
  DailyMetric,
  GrowthSeriesPoint,
} from "@/data/admin/system";

// ------------------------------------------------------------
// CONTRACT (future NestJS resources under /admin/dashboard/*)
// ------------------------------------------------------------

export type ChartRange = "7d" | "30d" | "90d";

export interface DashboardService {
  getStats(scopeCampusId?: string | null): Promise<DashboardStats>;
  getOverview(scopeCampusId?: string | null): Promise<PlatformOverview>;
  getRevenueSeries(range?: ChartRange): Promise<RevenuePoint[]>;
  getGrowth(kind: "users" | "vendors"): Promise<GrowthPoint[]>;
  getCampusSales(): Promise<CampusSalesRow[]>;
  getTopProducts(limit?: number): Promise<TopProductRow[]>;
  getLowStock(limit?: number): Promise<LowStockRow[]>;
  getRecentOrders(limit?: number): Promise<AdminOrder[]>;
  getActivity(
    query?: ListQuery & { kind?: ActivityFeedItem["kind"] | "all" }
  ): Promise<Paginated<ActivityFeedItem>>;
}

// ------------------------------------------------------------
// MOCK IMPLEMENTATION
// ------------------------------------------------------------

export interface MockDashboardSources {
  stats: Omit<
    DashboardStats,
    "gmvDeltaPct" | "ordersDeltaPct" | "activeUsersDeltaPct"
  >;
  dailyMetrics: DailyMetric[];
  growthSeries: GrowthSeriesPoint[];
  campusSales: CampusSalesRow[];
  topProducts: TopProductRow[];
  lowStock: LowStockRow[];
  topVendors: TopVendorRow[];
  recentOrders: AdminOrder[];
  activity: ActivityFeedItem[];
}

const RANGE_DAYS: Record<ChartRange, number> = { "7d": 7, "30d": 30, "90d": 90 };

function toRevenuePoints(metrics: DailyMetric[]): RevenuePoint[] {
  return metrics.map((m) => ({
    label: m.label,
    revenue: m.revenue,
    orders: m.orders,
  }));
}

function toGrowthPoints(series: GrowthSeriesPoint[], kind: "users" | "vendors"): GrowthPoint[] {
  return series.map((p) => ({
    label: p.label,
    total: kind === "users" ? p.usersTotal : p.vendorsTotal,
    added:
      kind === "users"
        ? Math.max(0, p.usersTotal - (series[0]?.usersTotal ?? p.usersTotal))
        : Math.max(0, p.vendorsTotal - (series[0]?.vendorsTotal ?? p.vendorsTotal)),
  }));
}

export function createMockDashboardService(
  sources: MockDashboardSources
): DashboardService {
  const { dailyMetrics } = sources;

  function slice(range: ChartRange): DailyMetric[] {
    return dailyMetrics.slice(-RANGE_DAYS[range]);
  }

  function sumRange(days: number): { revenue: number; orders: number; signups: number } {
    return dailyMetrics.slice(-days).reduce(
      (acc, m) => ({
        revenue: acc.revenue + m.revenue,
        orders: acc.orders + m.orders,
        signups: acc.signups + m.signups,
      }),
      { revenue: 0, orders: 0, signups: 0 }
    );
  }

  return {
    async getStats() {
      await apiDelay(120);
      // Deltas would be computed server-side against the prior period.
      return {
        ...sources.stats,
        gmvDeltaPct: 12.4,
        ordersDeltaPct: 8.1,
        activeUsersDeltaPct: -2.3,
      };
    },

    async getOverview() {
      await apiDelay(180);
      const today = sumRange(1);
      const week = sumRange(7);
      void today.signups;

      return {
        totals: {
          users: 19_842,
          activeUsers: 18_942,
          vendors: 886,
          verifiedVendors: 812,
          campuses: 8,
          products: 1_934,
          orders: 41_268,
          revenue: 284_600_000,
        },
        financial: {
          revenueToday: today.revenue,
          revenueWeek: week.revenue,
          revenueMonth: sumRange(30).revenue,
          pendingPaymentsCount: sources.stats.pendingWithdrawals + 5,
          pendingPaymentsAmount: 412_000,
          pendingWithdrawalsCount: sources.stats.pendingWithdrawals,
          pendingWithdrawalsAmount: sources.stats.pendingWithdrawalsAmount,
          platformEarnings: Math.round(sumRange(30).revenue * 0.08),
        },
        marketplace: {
          ordersToday: today.orders,
          ordersThisWeek: week.orders,
        },
        operations: {
          pendingVendorVerification: 6,
          pendingProductApproval: 14,
          pendingWithdrawalRequests: sources.stats.pendingWithdrawals,
          reportedProducts: 15,
          reportedUsers: 4,
          openDisputes: sources.stats.openDisputes,
        },
      };
    },

    async getRevenueSeries(range = "30d") {
      await apiDelay(150);
      return toRevenuePoints(slice(range));
    },

    async getGrowth(kind) {
      await apiDelay(150);
      return toGrowthPoints(sources.growthSeries, kind);
    },

    async getCampusSales() {
      await apiDelay(150);
      return sources.campusSales;
    },

    async getTopProducts(limit = 6) {
      await apiDelay(140);
      return sources.topProducts.slice(0, limit);
    },

    async getLowStock(limit = 6) {
      await apiDelay(140);
      return sources.lowStock.slice(0, limit);
    },

    async getRecentOrders(limit = 8) {
      await apiDelay(160);
      return sources.recentOrders.slice(0, limit);
    },

    async getActivity(query = {}) {
      await apiDelay(170);
      const {
        page = 1,
        pageSize = 8,
        kind = "all",
      } = query;

      const filtered =
        kind === "all"
          ? sources.activity
          : sources.activity.filter((a) => a.kind === kind);

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const safePage = Math.min(page, totalPages);

      return {
        items: filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
        page: safePage,
        pageSize,
        total,
        totalPages,
      };
    },
  };
}
