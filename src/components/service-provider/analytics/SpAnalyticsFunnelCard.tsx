"use client";

import { cn } from "@/lib/utils";
import type { SpFunnelStep } from "@/types/service-provider-analytics";

interface SpAnalyticsFunnelCardProps {
  funnel: SpFunnelStep[];
}

export function SpAnalyticsFunnelCard({ funnel }: SpAnalyticsFunnelCardProps) {
  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-4">
      <h3 className="text-sm font-semibold text-kampmax-text">Conversion funnel</h3>
      <p className="mt-0.5 text-xs text-kampmax-text-secondary">From request to completed</p>

      <ol className="mt-4 space-y-3">
        {funnel.map((step, i) => {
          const width = Math.max(2, Math.round(step.fromTop * 100));
          return (
            <li key={step.key}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-kampmax-text-secondary">
                  {i + 1}. {step.label}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-kampmax-text">{step.count}</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-sm bg-kampmax-muted">
                <div
                  className={cn(
                    "h-full rounded-sm transition-all",
                    i === 0 ? "bg-kampmax-navy" : "bg-primary-600"
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
              <p className="mt-0.5 text-[11px] text-kampmax-text-secondary">
                {i > 0 && (
                  <>
                    {Math.round(step.fromPrevious * 100)}% of {funnel[i - 1].label.toLowerCase()}
                    {" · "}
                  </>
                )}
                {Math.round(step.fromTop * 100)}% of incoming
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
