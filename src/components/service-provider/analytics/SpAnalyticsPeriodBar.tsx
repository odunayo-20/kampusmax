"use client";

import { ChangeEvent } from "react";
import { Select } from "@/components/ui";
import { SP_ANALYTICS_PERIOD_OPTIONS } from "@/config/service-analytics";
import type { SpAnalyticsPeriod, SpAnalyticsPeriodKey, SpAnalyticsWindow } from "@/types/service-provider-analytics";

interface SpAnalyticsPeriodBarProps {
  window: SpAnalyticsWindow;
  period: SpAnalyticsPeriod;
  onPeriodChange: (period: SpAnalyticsPeriod) => void;
}

/** Period selector for the Analytics module. Range picked here, window resolved
 * by the service to the Lagos timezone. */
export function SpAnalyticsPeriodBar({ window, period, onPeriodChange }: SpAnalyticsPeriodBarProps) {
  const handleKeyChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value as SpAnalyticsPeriodKey;
    onPeriodChange({ key, from: period.from, to: period.to });
  };

  const handleCustomDate = (field: "from" | "to") => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onPeriodChange({ key: "custom", from: field === "from" ? value : period.from, to: field === "to" ? value : period.to });
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-kampmax-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-kampmax-text">Reporting window</p>
        <p className="text-sm text-kampmax-text-secondary">
          {window.periodLabel} · {formatRange(window)}
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
        <Select value={period.key} onChange={handleKeyChange} className="w-full sm:w-44" aria-label="Analytics period">
          {SP_ANALYTICS_PERIOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </div>
    </section>
  );
}

function formatRange(window: SpAnalyticsWindow): string {
  const from = new Date(window.from).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  const to = new Date(window.to).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  return `${from} – ${to}`;
}
