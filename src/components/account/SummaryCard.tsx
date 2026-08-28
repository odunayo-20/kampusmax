"use client";

import type { ReactNode } from "react";

interface SummaryCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: "navy" | "blue" | "gold" | "green";
  onClick?: () => void;
}

const toneStyles = {
  navy: "text-kampmax-navy",
  blue: "text-kampmax-blue",
  gold: "text-kampmax-gold",
  green: "text-kampmax-success",
};

const iconBg: Record<string, string> = {
  navy: "bg-kampmax-navy/10",
  blue: "bg-kampmax-blue/10",
  gold: "bg-kampmax-gold/15",
  green: "bg-kampmax-success/10",
};

/** Dashboard summary stat card. */
export function SummaryCard({
  icon,
  label,
  value,
  hint,
  tone = "navy",
  onClick,
}: SummaryCardProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={
        onClick
          ? "bg-white rounded-xl border border-kampmax-border p-4 text-left hover:border-kampmax-blue/40 hover:shadow-sm transition-all"
          : "bg-white rounded-xl border border-kampmax-border p-4"
      }
    >
      <div className={`w-9 h-9 rounded-lg ${iconBg[tone]} flex items-center justify-center mb-2.5`}>
        <span className={`${toneStyles[tone]}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-kampmax-text tabular-nums leading-none">
        {value}
      </p>
      <p className="text-xs font-medium text-kampmax-text-secondary mt-1">
        {label}
      </p>
      {hint && <p className="text-[11px] text-kampmax-text-muted mt-0.5">{hint}</p>}
    </Comp>
  );
}
