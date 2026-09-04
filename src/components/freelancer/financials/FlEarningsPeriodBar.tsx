"use client";

import { formatNaira } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { FlEarningsPeriod, FlFinancialPeriodKey } from "@/types/freelancer-financials";

// Earnings by period (spec §10). All totals are backend-aggregated; selecting a
// period never re-aggregates in the browser.

export function FlEarningsPeriodBar({
  periods,
  active,
  onSelect,
}: {
  periods: FlEarningsPeriod[];
  active: FlFinancialPeriodKey;
  onSelect: (key: FlFinancialPeriodKey) => void;
}) {
  const activePeriod = periods.find((p) => p.key === active) ?? periods[periods.length - 1];

  return (
    <section aria-labelledby="earnings-period-heading" className="space-y-3">
      <h2 id="earnings-period-heading" className="text-sm font-semibold text-kampmax-text">
        Earnings by period
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Earnings period">
        {periods.map((p) => {
          const activeItem = active === p.key;
          return (
            <button
              key={p.key}
              role="tab"
              aria-selected={activeItem}
              onClick={() => onSelect(p.key)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                activeItem
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-kampmax-border bg-white text-kampmax-text hover:border-primary-400 hover:text-primary-700"
              )}
            >
              {p.periodLabel}
            </button>
          );
        })}
      </div>
      <div className="rounded-xl border border-kampmax-border bg-white p-4">
        <p className="text-sm text-kampmax-text-secondary">{activePeriod.periodLabel}</p>
        <p className="mt-1 text-2xl font-bold text-kampmax-text">{formatNaira(activePeriod.total)}</p>
        <p className="mt-0.5 text-xs text-kampmax-text-muted">
          {activePeriod.count} completed payment{activePeriod.count !== 1 ? "s" : ""}
        </p>
      </div>
    </section>
  );
}
