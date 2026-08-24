"use client";

import { BadgeCheck } from "lucide-react";
import { formatNaira, formatRating } from "@/lib/utils";
import type {
  AnalyticsCampusRow,
  AnalyticsProductRow,
  AnalyticsVendorRow,
} from "@/types/admin";

// ------------------------------------------------------------
// Compact analytics tables. Desktop table + mobile card fallback
// for every block, matching the rest of the admin console.
// ------------------------------------------------------------

function TableShell({
  head,
  children,
  minWidth = 760,
}: {
  head: string[];
  children: React.ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-kampmax-border bg-white">
      <div className="overflow-x-auto">
        <table
          className="w-full text-left text-sm"
          style={{ minWidth }}
        >
          <thead>
            <tr className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
              {head.map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={cnTh(i)}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function cnTh(i: number) {
  const base = "whitespace-nowrap px-3 py-2.5 font-medium";
  if (i === 0) return `${base} px-4`;
  return base;
}

const cellCls = "whitespace-nowrap px-3 py-2.5 tabular-nums";

// ---------------- Vendors performance ----------------

export function VendorsPerformanceTable({
  rows,
}: {
  rows: AnalyticsVendorRow[];
}) {
  return (
    <>
      <div className="hidden md:block">
        <TableShell
          minWidth={860}
          head={["Vendor", "Campus", "Orders", "Sales", "AOV", "Fulfilment", "Rating", "Disputes"]}
        >
          {rows.map((v) => (
            <tr key={v.vendorId} className="transition-colors hover:bg-kampmax-muted/30">
              <td className="max-w-[190px] px-4 py-2.5">
                <span className="flex items-center gap-1.5 truncate font-medium text-kampmax-text" title={v.storeName}>
                  {v.storeName}
                  {v.isNew && (
                    <span className="rounded bg-kampmax-blue/10 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-kampmax-blue">
                      New
                    </span>
                  )}
                </span>
                <span className="text-[11px] capitalize text-kampmax-text-secondary">{v.category}</span>
              </td>
              <td className={cellCls + " text-kampmax-text-secondary"}>{v.campusShortName}</td>
              <td className={cellCls}>{v.orders.toLocaleString("en-NG")}</td>
              <td className={cellCls + " font-medium"}>{formatNaira(v.revenue)}</td>
              <td className={cellCls + " text-kampmax-text-secondary"}>{formatNaira(v.aov)}</td>
              <td className={cellCls}>
                <span
                  className={
                    v.fulfillmentRate >= 90
                      ? "text-kampmax-success"
                      : v.fulfillmentRate >= 75
                        ? "text-amber-600"
                        : "text-kampmax-error"
                  }
                >
                  {v.fulfillmentRate}%
                </span>
              </td>
              <td className={cellCls}>{formatRating(v.rating)}</td>
              <td className={cellCls + (v.disputeRate > 5 ? " text-kampmax-error" : " text-kampmax-text-secondary")}>
                {v.disputeRate}%
              </td>
            </tr>
          ))}
        </TableShell>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-2 md:hidden">
        {rows.map((v) => (
          <li key={v.vendorId} className="rounded-lg border border-kampmax-border bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-medium text-kampmax-text">{v.storeName}</p>
              <span className="shrink-0 text-sm font-semibold tabular-nums">{formatNaira(v.revenue)}</span>
            </div>
            <dl className="mt-1.5 grid grid-cols-3 gap-x-3 gap-y-1 text-xs">
              <MiniStatCell label="Orders" value={v.orders.toLocaleString("en-NG")} />
              <MiniStatCell label="Fulfilment" value={`${v.fulfillmentRate}%`} />
              <MiniStatCell label="Rating" value={formatRating(v.rating)} />
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

// ---------------- Top products ----------------

export function TopProductsTable({ rows }: { rows: AnalyticsProductRow[] }) {
  return (
    <>
      <div className="hidden md:block">
        <TableShell
          minWidth={820}
          head={["#", "Product", "Vendor", "Campus", "Category", "Units", "Revenue"]}
        >
          {rows.map((p, i) => (
            <tr key={p.productId} className="transition-colors hover:bg-kampmax-muted/30">
              <td className="w-8 px-4 py-2.5 text-xs font-semibold tabular-nums text-kampmax-text-secondary">
                {i + 1}
              </td>
              <td className="max-w-[240px] truncate px-3 py-2.5 font-medium text-kampmax-text" title={p.title}>
                {p.title}
              </td>
              <td className={"max-w-[150px] truncate px-3 py-2.5 text-kampmax-text-secondary"} title={p.vendorName}>
                {p.vendorName}
              </td>
              <td className={cellCls + " text-kampmax-text-secondary"}>{p.campusShortName}</td>
              <td className={"px-3 py-2.5 text-xs capitalize text-kampmax-text-secondary"}>{p.category}</td>
              <td className={cellCls}>{p.unitsSold.toLocaleString("en-NG")}</td>
              <td className={cellCls + " font-medium"}>{formatNaira(p.revenue)}</td>
            </tr>
          ))}
        </TableShell>
      </div>

      <ul className="space-y-2 md:hidden">
        {rows.map((p, i) => (
          <li key={p.productId} className="rounded-lg border border-kampmax-border bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-medium text-kampmax-text">
                <span className="mr-1.5 text-kampmax-text-secondary">{i + 1}.</span>
                {p.title}
              </p>
              <span className="shrink-0 text-sm font-semibold tabular-nums">{formatNaira(p.revenue)}</span>
            </div>
            <p className="mt-1 truncate text-[11px] text-kampmax-text-secondary">
              {p.vendorName} · {p.campusShortName} · {p.unitsSold.toLocaleString("en-NG")} units
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

// ---------------- Campuses breakdown ----------------

export function CampusesTable({ rows }: { rows: AnalyticsCampusRow[] }) {
  const totals = rows.reduce(
    (a, r) => ({
      users: a.users + r.usersCount,
      orders: a.orders + r.orders,
      revenue: a.revenue + r.revenue,
      vendors: a.vendors + r.vendorsCount,
    }),
    { users: 0, orders: 0, revenue: 0, vendors: 0 }
  );

  return (
    <>
      <div className="hidden md:block">
        <TableShell
          minWidth={900}
          head={["Campus", "Users", "Active", "Orders", "Revenue", "Share", "Vendors", "AOV"]}
        >
          {rows.map((c) => (
            <tr key={c.campusId} className="transition-colors hover:bg-kampmax-muted/30">
              <td className="max-w-[200px] px-4 py-2.5">
                <span className="block truncate font-medium text-kampmax-text">{c.name}</span>
                <span className="text-[11px] font-semibold uppercase text-kampmax-text-secondary">
                  {c.shortName}
                </span>
              </td>
              <td className={cellCls}>{c.usersCount.toLocaleString("en-NG")}</td>
              <td className={cellCls}>
                <span className="inline-flex items-center gap-1 text-kampmax-success">
                  <BadgeCheck className="h-3 w-3" aria-hidden />
                  {c.activeUsers.toLocaleString("en-NG")}
                </span>
              </td>
              <td className={cellCls}>{c.orders.toLocaleString("en-NG")}</td>
              <td className={cellCls + " font-medium"}>{formatNaira(c.revenue)}</td>
              <td className={cellCls}>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-14 overflow-hidden rounded-full bg-kampmax-muted">
                    <span
                      className="block h-full rounded-full bg-kampmax-blue"
                      style={{
                        width: `${totals.revenue > 0 ? Math.max(3, Math.round((c.revenue / totals.revenue) * 100)) : 0}%`,
                      }}
                    />
                  </span>
                  {totals.revenue > 0
                    ? `${Math.round((c.revenue / totals.revenue) * 100)}%`
                    : "0%"}
                </span>
              </td>
              <td className={cellCls}>{c.vendorsCount}</td>
              <td className={cellCls + " text-kampmax-text-secondary"}>{formatNaira(c.aov)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-kampmax-border bg-kampmax-muted/30 font-semibold">
            <td className="px-4 py-2.5">All campuses</td>
            <td className={cellCls}>{totals.users.toLocaleString("en-NG")}</td>
            <td className={cellCls}>-</td>
            <td className={cellCls}>{totals.orders.toLocaleString("en-NG")}</td>
            <td className={cellCls}>{formatNaira(totals.revenue)}</td>
            <td className={cellCls}>100%</td>
            <td className={cellCls}>{totals.vendors}</td>
            <td className={cellCls}>-</td>
          </tr>
        </TableShell>
      </div>

      <ul className="space-y-2 md:hidden">
        {rows.map((c) => (
          <li key={c.campusId} className="rounded-lg border border-kampmax-border bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-kampmax-text">{c.name}</p>
                <p className="text-[11px] font-semibold uppercase text-kampmax-text-secondary">
                  {c.shortName}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums">{formatNaira(c.revenue)}</span>
            </div>
            <dl className="mt-1.5 grid grid-cols-4 gap-x-2 gap-y-1 text-xs">
              <MiniStatCell label="Users" value={c.usersCount.toLocaleString("en-NG")} />
              <MiniStatCell label="Orders" value={c.orders.toLocaleString("en-NG")} />
              <MiniStatCell label="Vendors" value={String(c.vendorsCount)} />
              <MiniStatCell label="AOV" value={formatNaira(c.aov)} />
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

function MiniStatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-kampmax-text-secondary">
        {label}
      </dt>
      <dd className="truncate tabular-nums text-kampmax-text">{value}</dd>
    </div>
  );
}
