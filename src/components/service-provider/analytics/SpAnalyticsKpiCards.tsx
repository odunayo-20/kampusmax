"use client";

import { cn } from "@/lib/utils";
import type { SpAnalyticsKpi, SpAnalyticsKpiTone } from "@/types/service-provider-analytics";

const TONE_CLASSES: Record<SpAnalyticsKpiTone, string> = {
  neutral: "bg-white border-kampmax-border",
  positive: "bg-white border-kampmax-success/20",
  negative: "bg-white border-kampmax-error/20",
  info: "bg-white border-kampmax-info/20",
  gold: "bg-white border-kampmax-gold/30",
};

const TONE_ACCENTS: Record<SpAnalyticsKpiTone, string> = {
  neutral: "bg-kampmax-muted",
  positive: "bg-kampmax-success/10",
  negative: "bg-kampmax-error/10",
  info: "bg-kampmax-info/10",
  gold: "bg-kampmax-gold/15",
};

const TONE_TEXT: Record<SpAnalyticsKpiTone, string> = {
  neutral: "text-kampmax-text",
  positive: "text-kampmax-success",
  negative: "text-kampmax-error",
  info: "text-kampmax-info",
  gold: "text-kampmax-gold-dark",
};

interface SpAnalyticsKpiCardsProps {
  kpis: SpAnalyticsKpi[];
}

export function SpAnalyticsKpiCards({ kpis }: SpAnalyticsKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <div
          key={kpi.key}
          className={cn(
            "rounded-xl border p-4 transition-shadow hover:shadow-md",
            TONE_CLASSES[kpi.tone]
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-kampmax-text-secondary">{kpi.label}</p>
              <p className="mt-1 truncate text-xl font-bold text-kampmax-text">{kpi.value}</p>
              {kpi.sublabel && (
                <p className="mt-1 truncate text-xs text-kampmax-text-secondary">{kpi.sublabel}</p>
              )}
            </div>
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                TONE_ACCENTS[kpi.tone]
              )}
              aria-hidden
            >
              <div className={cn("h-2 w-2 rounded-full", TONE_TEXT[kpi.tone])} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
