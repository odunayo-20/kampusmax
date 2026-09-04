"use client";

import { formatNaira } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { FlFinancialSummaryCard, FlFinancialSummaryTone } from "@/types/freelancer-financials";

const TONE_CLASSES: Record<FlFinancialSummaryTone, string> = {
  neutral: "bg-white border-kampmax-border",
  positive: "bg-white border-kampmax-success/20",
  negative: "bg-white border-kampmax-error/20",
  info: "bg-white border-kampmax-info/20",
};

const TONE_ACCENTS: Record<FlFinancialSummaryTone, string> = {
  neutral: "bg-kampmax-muted",
  positive: "bg-kampmax-success/10",
  negative: "bg-kampmax-error/10",
  info: "bg-kampmax-info/10",
};

const TONE_TEXT: Record<FlFinancialSummaryTone, string> = {
  neutral: "text-kampmax-text",
  positive: "text-kampmax-success",
  negative: "text-kampmax-error",
  info: "text-kampmax-info",
};

export function FlFinancialSummaryCards({ cards }: { cards: FlFinancialSummaryCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className={cn("rounded-xl border p-4", TONE_CLASSES[card.tone])}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-kampmax-text-secondary">{card.label}</p>
              <p className="mt-1 text-2xl font-bold text-kampmax-text">{formatNaira(card.value)}</p>
              {card.sublabel && (
                <p className="mt-1 text-xs text-kampmax-text-secondary">{card.sublabel}</p>
              )}
            </div>
            <div
              className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", TONE_ACCENTS[card.tone])}
              aria-hidden
            >
              <div className={cn("h-2 w-2 rounded-full", TONE_TEXT[card.tone])} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
