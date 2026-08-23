"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock,
  Landmark,
  Package,
  Scale,
  ShoppingBag,
  Star,
  Store,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartCard } from "@/components/admin/ChartCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { MiniStat, StatCard } from "@/components/admin/StatCard";
import { StatusBadge, orderStatusVariant } from "@/components/admin/StatusBadge";
import { formatNaira, formatNairaCompact, timeAgo, cn } from "@/lib/utils";
import { dashboardService, type ChartRange } from "@/services/admin";
import { mockTopVendors } from "@/data/admin/system";
import type {
  ActivityFeedItem,
  AdminOrder,
  CampusSalesRow,
  FinancialMetrics,
  LowStockRow,
  MarketplaceMetrics,
  OperationsQueue,
  OverviewTotals,
  TopProductRow,
} from "@/types/admin";

type OverviewState<T> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: T };

const CARD = "rounded-lg border border-kampmax-border bg-white";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [totals, setTotals] = useState<OverviewState<OverviewTotals>>({ status: "loading" });
  const [financial, setFinancial] = useState<OverviewState<FinancialMetrics>>({ status: "loading" });
  const [marketplace, setMarketplace] = useState<OverviewState<MarketplaceMetrics>>({ status: "loading" });
  const [operations, setOperations] = useState<OverviewState<OperationsQueue>>({ status: "loading" });

  const [range, setRange] = useState<ChartRange>("30d");
  const [revenueSeries, setRevenueSeries] = useState<OverviewState<{ label: string; revenue: number; orders: number }[]>>({ status: "loading" });
  const [usersGrowth, setUsersGrowth] = useState<OverviewState<{ label: string; total: number; added: number }[]>>({ status: "loading" });
  const [vendorsGrowth, setVendorsGrowth] = useState<OverviewState<{ label: string; total: number; added: number }[]>>({ status: "loading" });

  const [campusSales, setCampusSales] = useState<OverviewState<CampusSalesRow[]>>({ status: "loading" });
  const [topProducts, setTopProducts] = useState<OverviewState<TopProductRow[]>>({ status: "loading" });
  const [lowStock, setLowStock] = useState<OverviewState<LowStockRow[]>>({ status: "loading" });
  const [recentOrders, setRecentOrders] = useState<OverviewState<AdminOrder[]>>({ status: "loading" });
  const [activity, setActivity] = useState<OverviewState<ActivityFeedItem[]>>({ status: "loading" });
  const [activityKind, setActivityKind] = useState<ActivityFeedItem["kind"] | "all">("all");

  const loadRevenue = useCallback((r: ChartRange) => {
    setRevenueSeries({ status: "loading" });
    dashboardService
      .getRevenueSeries(r)
      .then((data) => setRevenueSeries({ status: "ready", data }))
      .catch(() => setRevenueSeries({ status: "error" }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const guard = <T,>(p: Promise<T>, set: (v: OverviewState<T>) => void) =>
      p.then((data) => !cancelled && set({ status: "ready", data })).catch(() => !cancelled && set({ status: "error" }));

    guard(dashboardService.getOverview(), (v) => {
      if (v.status === "ready") {
        setTotals({ status: "ready", data: v.data.totals });
        setFinancial({ status: "ready", data: v.data.financial });
        setMarketplace({ status: "ready", data: v.data.marketplace });
        setOperations({ status: "ready", data: v.data.operations });
      }
    });
    loadRevenue("30d");
    guard(dashboardService.getGrowth("users"), setUsersGrowth);
    guard(dashboardService.getGrowth("vendors"), setVendorsGrowth);
    guard(dashboardService.getCampusSales(), setCampusSales);
    guard(dashboardService.getTopProducts(), setTopProducts);
    guard(dashboardService.getLowStock(), setLowStock);
    guard(dashboardService.getRecentOrders(8), setRecentOrders);
    guard(
      dashboardService.getActivity({ pageSize: 50 }).then((p) => p.items),
      setActivity
    );

    return () => {
      cancelled = true;
    };
  }, [loadRevenue]);

  const readyOrNull = <T,>(s: OverviewState<T>): T | null =>
    s.status === "ready" ? s.data : null;

  const totalsData = readyOrNull(totals);
  const financialData = readyOrNull(financial);
  const marketplaceData = readyOrNull(marketplace);
  const operationsData = readyOrNull(operations);

  const filteredActivity = readyOrNull(activity)?.filter(
    (a) => activityKind === "all" || a.kind === activityKind
  );

  return (
    <>
      <AdminPageHeader
        title="Platform overview"
        description="Live snapshot of marketplace health across all campuses."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 py-1.5 text-xs text-kampmax-text-secondary">
            <Clock className="h-3.5 w-3.5" />
            Updated {new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
          </span>
        }
      />

      {/* ---------------- Operations queue ---------------- */}
      <section aria-label="Operations queue" className="mb-4">
        {operations.status === "loading" ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[58px] animate-pulse rounded-md bg-kampmax-muted/70" />
            ))}
          </div>
        ) : operations.status === "error" || !operationsData ? (
          <ErrorState compact onRetry={() => window.location.reload()} />
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <MiniStat label="Vendor verifications" value={String(operationsData.pendingVendorVerification)} tone="warning" />
            <MiniStat label="Product approvals" value={String(operationsData.pendingProductApproval)} tone="warning" onClick={() => router.push("/admin/products?status=pending_review")} />
            <MiniStat label="Withdrawal requests" value={String(operationsData.pendingWithdrawalRequests)} tone="warning" onClick={() => router.push("/admin/withdrawals?status=pending")} />
            <MiniStat label="Reported products" value={String(operationsData.reportedProducts)} tone="error" onClick={() => router.push("/admin/products?status=flagged")} />
            <MiniStat label="Reported users" value={String(operationsData.reportedUsers)} tone="error" onClick={() => router.push("/admin/users?status=suspended")} />
            <MiniStat label="Open disputes" value={String(operationsData.openDisputes)} tone="error" onClick={() => router.push("/admin/disputes?status=open")} />
          </div>
        )}
      </section>

      {/* ---------------- Core metrics ---------------- */}
      <section aria-label="Core metrics" className="mb-4">
        {totals.status === "loading" ? (
          <LoadingSkeleton variant="cards" rows={8} />
        ) : totals.status === "error" || !totalsData ? (
          <ErrorState compact onRetry={() => window.location.reload()} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total users" value={totalsData.users.toLocaleString("en-NG")} icon={Users} deltaPct={6.2} deltaLabel="vs last month" />
            <StatCard label="Active users (30d)" value={totalsData.activeUsers.toLocaleString("en-NG")} icon={BadgeCheck} deltaPct={-2.3} deltaLabel="vs last month" />
            <StatCard label="Total vendors" value={totalsData.vendors.toLocaleString("en-NG")} icon={Store} deltaPct={9.8} deltaLabel="vs last month" />
            <StatCard label="Verified vendors" value={totalsData.verifiedVendors.toLocaleString("en-NG")} icon={Store} tone="success" hint={`${Math.round((totalsData.verifiedVendors / Math.max(totalsData.vendors, 1)) * 100)}% of all stores`} />
            <StatCard label="Total campuses" value={String(totalsData.campuses)} icon={Building2} hint="7 live · 1 in setup" />
            <StatCard label="Total products" value={totalsData.products.toLocaleString("en-NG")} icon={Package} deltaPct={11.5} deltaLabel="vs last month" />
            <StatCard label="Total orders" value={totalsData.orders.toLocaleString("en-NG")} icon={ShoppingBag} deltaPct={8.1} deltaLabel="vs last month" />
            <StatCard label="Total revenue (GMV)" value={formatNairaCompact(totalsData.revenue)} icon={Landmark} tone="gold" deltaPct={12.4} deltaLabel="vs last month" />
          </div>
        )}
      </section>

      {/* ---------------- Financials ---------------- */}
      <section aria-label="Financial metrics" className="mb-4">
        {financial.status === "loading" ? (
          <div className={cn(CARD, "animate-pulse p-4")}>
            <div className="mb-4 h-4 w-40 rounded bg-kampmax-muted" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-7">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-[58px] animate-pulse rounded-md bg-kampmax-muted/70" />
              ))}
            </div>
          </div>
        ) : financial.status === "error" || !financialData ? (
          <ErrorState compact onRetry={() => window.location.reload()} />
        ) : (
          <div className={cn(CARD, "p-4")}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-kampmax-text">Financial summary</h2>
              <Link href="/admin/payments" className="text-xs font-medium text-kampmax-blue hover:underline">
                Payment ledger
                <ArrowRight className="ml-0.5 inline h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-7">
              <MiniStat label="Revenue today" value={formatNairaCompact(financialData.revenueToday)} />
              <MiniStat label="Revenue this week" value={formatNairaCompact(financialData.revenueWeek)} />
              <MiniStat label="Revenue this month" value={formatNairaCompact(financialData.revenueMonth)} />
              <MiniStat label="Pending payments" value={`${financialData.pendingPaymentsCount} · ${formatNairaCompact(financialData.pendingPaymentsAmount)}`} tone="warning" onClick={() => router.push("/admin/payments?status=pending")} />
              <MiniStat label="Pending withdrawals" value={`${financialData.pendingWithdrawalsCount} · ${formatNairaCompact(financialData.pendingWithdrawalsAmount)}`} tone="warning" onClick={() => router.push("/admin/withdrawals?status=pending")} />
              <MiniStat label="Platform earnings (30d)" value={formatNairaCompact(financialData.platformEarnings)} tone="success" />
              <MiniStat label="Avg order value (today)" value={formatNaira(marketplaceData ? Math.round(financialData.revenueToday / Math.max(marketplaceData.ordersToday, 1)) : 0)} />
            </div>
          </div>
        )}
      </section>

      {/* ---------------- Revenue & orders over time ---------------- */}
      <section aria-label="Commerce trends" className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
        <ChartCard
          title="Revenue over time"
          subtitle={`GMV across all campuses · last ${range}`}
          type="bar"
          accent="blue"
          loading={revenueSeries.status === "loading"}
          data={
            revenueSeries.status === "ready"
              ? revenueSeries.data.map((p) => ({ label: p.label, value: p.revenue }))
              : []
          }
          formatValue={(v) => formatNaira(v)}
          height={190}
          toolbar={<RangeTabs value={range} onChange={(r) => { setRange(r); loadRevenue(r); }} />}
        />
        <ChartCard
          title="Orders over time"
          subtitle={`Completed + open orders · last ${range}`}
          type="line"
          accent="navy"
          loading={revenueSeries.status === "loading"}
          data={
            revenueSeries.status === "ready"
              ? revenueSeries.data.map((p) => ({ label: p.label, value: p.orders, secondary: undefined }))
              : []
          }
          formatValue={(v) => `${v.toLocaleString("en-NG")} orders`}
          height={190}
          toolbar={<RangeTabs value={range} onChange={(r) => { setRange(r); loadRevenue(r); }} />}
        />
      </section>

      {/* ---------------- Growth & campus sales ---------------- */}
      <section aria-label="Growth and campus distribution" className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-3">
        <ChartCard
          title="User growth"
          subtitle="Cumulative registered users · weekly"
          type="area"
          accent="green"
          loading={usersGrowth.status === "loading"}
          data={usersGrowth.status === "ready" ? usersGrowth.data.map((p) => ({ label: p.label, value: p.total })) : []}
          formatValue={(v) => v.toLocaleString("en-NG")}
          height={170}
          showXLabelsEvery={3}
        />
        <ChartCard
          title="Vendor growth"
          subtitle="Cumulative onboarded stores · weekly"
          type="area"
          accent="gold"
          loading={vendorsGrowth.status === "loading"}
          data={vendorsGrowth.status === "ready" ? vendorsGrowth.data.map((p) => ({ label: p.label, value: p.total })) : []}
          formatValue={(v) => v.toLocaleString("en-NG")}
          height={170}
          showXLabelsEvery={3}
        />
        <ChartCard
          title="Sales by campus"
          subtitle="GMV share this month"
          type="hbar"
          accent="navy"
          loading={campusSales.status === "loading"}
          data={
            campusSales.status === "ready"
              ? campusSales.data.map((c) => ({ label: c.shortName, value: c.revenue, secondary: `${c.sharePct}%` }))
              : []
          }
          formatValue={(v) => formatNairaCompact(v)}
        />
      </section>

      {/* ---------------- Marketplace analytics lists ---------------- */}
      <section aria-label="Marketplace analytics" className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-3">
        {/* Top products */}
        {topProducts.status === "error" ? (
          <ErrorState compact onRetry={() => window.location.reload()} />
        ) : topProducts.status !== "ready" ? (
          <LoadingSkeleton variant="detail" rows={6} />
        ) : (
          <div className={CARD}>
            <PanelHeader title="Top-selling products" subtitle="By units moved (30d)" href="/admin/products" linkLabel="All products" />
            <ul className="divide-y divide-kampmax-border/70">
              {topProducts.data.map((p, i) => (
                <li key={p.productId} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-5 shrink-0 text-center text-xs font-bold text-kampmax-text-secondary/70">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-kampmax-text">{p.title}</p>
                    <p className="truncate text-xs text-kampmax-text-secondary">
                      {p.vendorName} · {p.campusShortName}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-kampmax-text">{formatNairaCompact(p.revenue)}</p>
                    <p className="text-xs tabular-nums text-kampmax-text-secondary">{p.unitsSold} sold</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Top vendors */}
        <div className={CARD}>
          <PanelHeader title="Top-performing vendors" subtitle="By lifetime sales" href="/admin/vendors" linkLabel="All vendors" />
          <ul className="divide-y divide-kampmax-border/70">
            {(mockTopVendorsFallback ?? []).slice(0, 6).map((v) => (
              <li key={v.vendorId} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-kampmax-text">{v.storeName}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-kampmax-text-secondary">
                    {v.campusShortName}
                    <Star className="h-3 w-3 fill-kampmax-gold text-kampmax-gold" />
                    <span className="tabular-nums">{v.rating.toFixed(1)}</span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums text-kampmax-text">{formatNairaCompact(v.revenue)}</p>
                  <p className="text-xs tabular-nums text-kampmax-text-secondary">{v.orders} orders</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Low stock */}
        {lowStock.status === "error" ? (
          <ErrorState compact onRetry={() => window.location.reload()} />
        ) : lowStock.status !== "ready" ? (
          <LoadingSkeleton variant="detail" rows={6} />
        ) : (
          <div className={CARD}>
            <PanelHeader title="Low-stock listings" subtitle="Running out - vendors should restock" href="/admin/products" linkLabel="Inventory" />
            <ul className="divide-y divide-kampmax-border/70">
              {lowStock.data.map((p) => (
                <li key={p.productId} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-kampmax-text">{p.title}</p>
                    <p className="truncate text-xs text-kampmax-text-secondary">{p.vendorName}</p>
                  </div>
                  <StatusBadge
                    dot={false}
                    variant={p.stock <= 2 ? "error" : p.stock <= 5 ? "warning" : "neutral"}
                    label={`${p.stock} left`}
                    className="shrink-0 tabular-nums"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ---------------- Recent orders + activity feed ---------------- */}
      <section aria-label="Recent activity" className="grid grid-cols-1 gap-3 xl:grid-cols-5">
        {/* Recent orders */}
        <div className={cn(CARD, "xl:col-span-3")}>
          <PanelHeader title="Recent orders" subtitle="Latest transactions across campuses" href="/admin/orders" linkLabel="All orders" />
          {recentOrders.status === "error" ? (
            <ErrorState compact className="m-4" onRetry={() => window.location.reload()} />
          ) : recentOrders.status !== "ready" ? (
            <LoadingSkeleton variant="table" rows={6} className="border-0" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-kampmax-border bg-kampmax-muted/50 text-left text-xs uppercase tracking-wide text-kampmax-text-secondary">
                    <th className="px-4 py-2 font-medium">Order</th>
                    <th className="px-4 py-2 font-medium">Customer</th>
                    <th className="hidden px-4 py-2 font-medium md:table-cell">Vendor</th>
                    <th className="px-4 py-2 text-right font-medium">Total</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kampmax-border/70">
                  {recentOrders.data.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-kampmax-muted/40">
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <span className="font-mono text-xs font-semibold text-kampmax-blue">{o.id}</span>
                        <span className="block text-[11px] text-kampmax-text-secondary">{timeAgo(o.createdAt)}</span>
                      </td>
                      <td className="max-w-[140px] truncate px-4 py-2.5">{o.customerName}</td>
                      <td className="hidden max-w-[150px] truncate px-4 py-2.5 md:table-cell">{o.vendorName}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold tabular-nums">{formatNaira(o.total)}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge variant={orderStatusVariant(o.status)} label={o.status.replace(/_/g, " ")} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className={cn(CARD, "xl:col-span-2")}>
          <PanelHeader title="Activity feed" />
          <div className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar" role="tablist" aria-label="Filter activity">
            {(["all", "order", "registration", "vendor_application", "report"] as const).map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={activityKind === k}
                onClick={() => setActivityKind(k)}
                className={cn(
                  "whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  activityKind === k
                    ? "bg-kampmax-navy text-white"
                    : "text-kampmax-text-secondary hover:bg-kampmax-muted hover:text-kampmax-text"
                )}
              >
                {ACTIVITY_TAB_LABELS[k]}
              </button>
            ))}
          </div>

          {activity.status === "error" ? (
            <ErrorState compact className="m-4 border-solid" onRetry={() => window.location.reload()} />
          ) : activity.status !== "ready" ? (
            <div className="divide-y divide-kampmax-border/70">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-kampmax-muted" />
                  <div className="flex-1 space-y-1.5 py-0.5">
                    <div className="h-3 w-full animate-pulse rounded bg-kampmax-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-kampmax-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredActivity && filteredActivity.length > 0 ? (
            <ul className="max-h-[380px] divide-y divide-kampmax-border/70 overflow-y-auto">
              {filteredActivity.slice(0, 14).map((item) => (
                <li key={item.id} className="flex items-start gap-3 px-4 py-2.5">
                  <ActivityIcon kind={item.kind} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-kampmax-text">{item.message}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-kampmax-text-secondary">
                      <span>{item.meta}</span>·<span>{timeAgo(item.at)}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              compact
              className="m-4"
              icon={ShoppingBag}
              title="No activity yet"
              message="Events will appear here as they happen."
            />
          )}
        </div>
      </section>
    </>
  );
}

// ------------------------------------------------------------
// Local helpers
// ------------------------------------------------------------

const ACTIVITY_TAB_LABELS: Record<ActivityFeedItem["kind"] | "all", string> = {
  all: "All",
  order: "Orders",
  registration: "Signups",
  vendor_application: "Applications",
  report: "Reports",
};

function ActivityIcon({ kind }: { kind: ActivityFeedItem["kind"] }) {
  const cls = "flex h-7 w-7 shrink-0 items-center justify-center rounded-full";
  switch (kind) {
    case "order":
      return <span className={cn(cls, "bg-kampmax-blue/10")}><ShoppingBag className="h-3.5 w-3.5 text-kampmax-blue" /></span>;
    case "registration":
      return <span className={cn(cls, "bg-kampmax-success/10")}><Users className="h-3.5 w-3.5 text-kampmax-success" /></span>;
    case "vendor_application":
      return <span className={cn(cls, "bg-kampmax-gold/15")}><Store className="h-3.5 w-3.5 text-kampmax-gold-dark" /></span>;
    case "report":
      return <span className={cn(cls, "bg-kampmax-error/10")}><Scale className="h-3.5 w-3.5 text-kampmax-error" /></span>;
  }
}

function PanelHeader({
  title,
  subtitle,
  href,
  linkLabel,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-kampmax-border px-4 py-3">
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold text-kampmax-text">{title}</h2>
        {subtitle && <p className="mt-0.5 truncate text-xs text-kampmax-text-secondary">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-kampmax-blue transition-colors hover:text-kampmax-blue-dark"
        >
          {linkLabel}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function RangeTabs({
  value,
  onChange,
}: {
  value: ChartRange;
  onChange: (r: ChartRange) => void;
}) {
  return (
    <div className="flex rounded-md border border-kampmax-border bg-kampmax-bg p-0.5" role="group" aria-label="Date range">
      {(["7d", "30d", "90d"] as const).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          aria-pressed={value === r}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
            value === r
              ? "bg-white text-kampmax-text shadow-sm ring-1 ring-kampmax-border"
              : "text-kampmax-text-secondary hover:text-kampmax-text"
          )}
        >
          {r.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// Top-vendors panel reads straight from mock until the analytics API
// exposes an endpoint; kept out of component state intentionally.
const mockTopVendorsFallback = mockTopVendors;
