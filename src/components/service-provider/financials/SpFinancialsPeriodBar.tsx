"use client";

import { ChangeEvent } from "react";
import { Select } from "@/components/ui";
import { formatNaira } from "@/lib/utils";
import { SP_PERIOD_OPTIONS } from "./sp-financials-meta";
import type { SpEarningsBreakdown, SpFinancialPeriod, SpFinancialPeriodKey } from "@/types/service-provider-financials";

interface SpFinancialsPeriodBarProps {
  period: SpFinancialPeriod;
  onPeriodChange: (period: SpFinancialPeriod) => void;
  breakdown: SpEarningsBreakdown;
}

/** Period earnings breakdown. Backend-computed; this UI never derives money. */
export function SpFinancialsPeriodBar({ period, onPeriodChange, breakdown }: SpFinancialsPeriodBarProps) {
  const handleKeyChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value as SpFinancialPeriodKey;
    onPeriodChange({ key, from: period.from, to: period.to });
  };

  const handleCustomDate = (field: "from" | "to") => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onPeriodChange({ key: "custom", from: field === "from" ? value : period.from, to: field === "to" ? value : period.to });
  };

  return (
    <section aria-labelledby="breakdown-heading" className="rounded-xl border border-kampmax-border bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="breakdown-heading" className="text-lg font-semibold text-kampmax-text">
            Earnings breakdown
          </h2>
          <p className="text-sm text-kampmax-text-secondary">
            {breakdown.periodLabel} · {breakdown.settledCount} settled booking{breakdown.settledCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          {period.key === "custom" && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-kampmax-text-secondary">From</label>
              <input type="date" value={period.from ?? ""} onChange={handleCustomDate("from")} className="h-9 rounded-md border border-neutral-200 px-2 text-sm" aria-label="From date" />
              <label className="text-xs text-kampmax-text-secondary">To</label>
              <input type="date" value={period.to ?? ""} onChange={handleCustomDate("to")} className="h-9 rounded-md border border-neutral-200 px-2 text-sm" aria-label="To date" />
            </div>
          )}
          <Select value={period.key} onChange={handleKeyChange} className="w-full sm:w-44" aria-label="Earnings period">
            {SP_PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatLine label="Gross revenue" value={breakdown.gross} />
        <StatLine label="Platform fees" value={breakdown.platformFees} tone="negative" />
        <StatLine label="Tax" value={breakdown.tax} tone="neutral" />
        <StatLine label="Net earnings" value={breakdown.net} tone="positive" strong />
      </div>

      {breakdown.payoutCount > 0 && (
        <p className="mt-3 text-xs text-kampmax-text-secondary">
          Payouts in period: {formatNaira(breakdown.payoutTotal)} across {breakdown.payoutCount} withdrawal{breakdown.payoutCount !== 1 ? "s" : ""}.
        </p>
      )}
    </section>
  );
}

function StatLine({ label, value, tone = "neutral", strong = false }: { label: string; value: number; tone?: "neutral" | "positive" | "negative"; strong?: boolean }) {
  const color =
    tone === "positive" ? "text-kampmax-success" : tone === "negative" ? "text-kampmax-error" : "text-kampmax-text";
  return (
    <div className="rounded-lg bg-neutral-50 p-3">
      <p className="text-xs font-medium text-kampmax-text-secondary">{label}</p>
      <p className={strong ? `mt-1 text-xl font-bold ${color}` : `mt-1 text-lg font-semibold ${color}`}>
        {formatNaira(value)}
      </p>
    </div>
  );
}