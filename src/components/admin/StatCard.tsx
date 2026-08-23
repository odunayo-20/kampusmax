import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  deltaPct?: number; // signed percentage vs previous period
  deltaLabel?: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "error" | "gold" | "blue";
  onClick?: () => void;
  className?: string;
}

const TONES = {
  default: "bg-kampmax-muted text-kampmax-text-secondary",
  success: "bg-kampmax-success/10 text-kampmax-success",
  warning: "bg-kampmax-warning/10 text-amber-600",
  error: "bg-kampmax-error/10 text-kampmax-error",
  gold: "bg-kampmax-gold/15 text-kampmax-gold-dark",
  blue: "bg-kampmax-blue/10 text-kampmax-blue",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  deltaPct,
  deltaLabel,
  hint,
  tone = "default",
  onClick,
  className,
}: StatCardProps) {
  const up = (deltaPct ?? 0) >= 0;
  const DeltaIcon = up ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        "rounded-lg border border-kampmax-border bg-white p-4 transition-shadow",
        onClick && "cursor-pointer hover:border-kampmax-blue/40 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kampmax-blue",
        className
      )}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium leading-snug text-kampmax-text-secondary">
          {label}
        </p>
        {Icon && (
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              TONES[tone]
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight text-kampmax-text tabular-nums">
        {value}
      </p>
      {(deltaPct !== undefined || hint) && (
        <div className="mt-1.5 flex items-center gap-2 text-xs">
          {deltaPct !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium tabular-nums",
                up ? "text-kampmax-success" : "text-kampmax-error"
              )}
            >
              <DeltaIcon className="h-3 w-3" />
              {up ? "+" : ""}
              {deltaPct.toFixed(1)}%
            </span>
          )}
          {(deltaLabel || hint) && (
            <span className="truncate text-kampmax-text-secondary">
              {deltaLabel ?? hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Compact metric tile for dense financial/ops grids. */
export function MiniStat({
  label,
  value,
  tone = "neutral",
  onClick,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "warning" | "error" | "success";
  onClick?: () => void;
}) {
  const valueTone = {
    neutral: "text-kampmax-text",
    warning: "text-amber-600",
    error: "text-kampmax-error",
    success: "text-kampmax-success",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "flex flex-col items-start rounded-md border border-kampmax-border bg-white px-3 py-2.5 text-left",
        onClick && "transition-colors hover:border-kampmax-blue/40 hover:bg-kampmax-muted/40"
      )}
    >
      <span className="text-[11px] font-medium text-kampmax-text-secondary">
        {label}
      </span>
      <span className={cn("mt-0.5 text-sm font-semibold tabular-nums", valueTone)}>
        {value}
      </span>
    </button>
  );
}
