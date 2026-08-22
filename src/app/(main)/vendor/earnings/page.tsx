"use client";

import { useState } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Calendar, Download } from "lucide-react";
import { cn, formatNaira } from "@/lib/utils";
import { getEarningsSummary, getDailyEarnings } from "@/services/vendor";
import { VendorDailyEarning } from "@/types";

export default function VendorEarningsPage() {
  const summary = getEarningsSummary();
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");
  const daily = getDailyEarnings();

  const filteredDaily =
    period === "week"
      ? daily.slice(-7)
      : period === "month"
        ? daily.slice(-30)
        : daily;

  const maxRevenue = Math.max(...filteredDaily.map((d) => d.revenue), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-kampmax-text">Earnings</h1>
          <p className="text-sm text-kampmax-text-secondary">Track your revenue and payouts</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-kampmax-muted text-xs font-medium text-kampmax-text">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-kampmax-navy to-kampmax-blue rounded-xl p-4 text-white">
          <p className="text-xs text-white/60 mb-1">Total Earning</p>
          <p className="text-2xl font-bold">{formatNaira(summary.totalEarning)}</p>
          <p className="text-[11px] text-white/60 mt-1">From {summary.orderCount} orders</p>
        </div>
        <div className="bg-white rounded-xl border border-kampmax-border p-4">
          <p className="text-xs text-kampmax-text-secondary mb-1">Pending Payout</p>
          <p className="text-2xl font-bold text-kampmax-gold">{formatNaira(summary.pendingPayout)}</p>
          <p className="text-[11px] text-kampmax-text-secondary mt-1">Next payout in 3 days</p>
        </div>
      </div>

      {/* Growth */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-kampmax-text">Monthly Comparison</h3>
          <span className={cn(
            "text-xs font-medium flex items-center gap-1",
            summary.growth > 0 ? "text-kampmax-success" : "text-kampmax-error"
          )}>
            {summary.growth > 0 ? <TrendingUp className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {summary.growth > 0 ? "+" : ""}{summary.growth}%
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-kampmax-text-secondary">This Month</p>
            <p className="text-lg font-bold text-kampmax-text">{formatNaira(summary.thisMonth)}</p>
          </div>
          <div>
            <p className="text-[11px] text-kampmax-text-secondary">Last Month</p>
            <p className="text-lg font-bold text-kampmax-text">{formatNaira(summary.lastMonth)}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-kampmax-text">Revenue Trend</h3>
          <div className="flex gap-1">
            {(["week", "month", "all"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn("px-2 py-1 rounded text-[11px] font-medium transition-colors",
                  period === p ? "bg-kampmax-navy text-white" : "text-kampmax-text-secondary"
                )}>
                {p === "week" ? "7D" : p === "month" ? "30D" : "All"}
              </button>
            ))}
          </div>
        </div>
        {/* Simple bar chart */}
        <div className="flex items-end gap-1 h-32">
          {filteredDaily.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-kampmax-blue/20 rounded-t relative" style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: d.revenue > 0 ? "4px" : "0" }}>
                {d.revenue > 0 && (
                  <div className="absolute inset-0 bg-kampmax-blue rounded-t" />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-1 mt-1">
          {filteredDaily.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[9px] text-kampmax-text-secondary">
                {new Date(d.date).getDate()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <h3 className="text-sm font-semibold text-kampmax-text mb-3">Earnings Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-kampmax-text-secondary">Total Revenue</span>
            <span className="text-sm font-bold text-kampmax-text">{formatNaira(summary.totalRevenue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-kampmax-text-secondary">Platform Fees (5%)</span>
            <span className="text-sm font-bold text-kampmax-error">-{formatNaira(summary.platformFees)}</span>
          </div>
          <div className="border-t border-kampmax-border pt-2 flex justify-between items-center">
            <span className="text-sm font-semibold text-kampmax-text">Net Earnings</span>
            <span className="text-base font-bold text-kampmax-success">{formatNaira(summary.totalEarning)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
