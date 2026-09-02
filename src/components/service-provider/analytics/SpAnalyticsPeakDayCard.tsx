"use client";

import { formatNaira } from "@/lib/utils";
import type { SpPeakDay } from "@/types/service-provider-analytics";

interface SpAnalyticsPeakDayCardProps {
  peakDay: SpPeakDay;
}

export function SpAnalyticsPeakDayCard({ peakDay }: SpAnalyticsPeakDayCardProps) {
  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-4">
      <h3 className="text-sm font-semibold text-kampmax-text">Busiest day</h3>
      <p className="mt-0.5 text-xs text-kampmax-text-secondary">By booking volume</p>

      <div className="mt-4 flex flex-col items-center rounded-lg bg-neutral-50 p-4">
        <span className="text-3xl font-bold text-kampmax-text">{peakDay.weekday}</span>
        <span className="mt-1 text-2xl font-semibold tabular-nums text-kampmax-text">{peakDay.bookings}</span>
        <span className="text-xs text-kampmax-text-secondary">bookings</span>
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-kampmax-text-secondary">Share of weekly volume</span>
          <span className="font-medium tabular-nums text-kampmax-text">{Math.round(peakDay.share * 100)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-kampmax-text-secondary">Revenue that day</span>
          <span className="font-medium tabular-nums text-kampmax-text">{formatNaira(peakDay.revenue)}</span>
        </div>
      </div>
    </div>
  );
}
