"use client";

import { cn } from "@/lib/utils";

// Project progress bar — workflow/project completion only. The percentage
// (and milestone counts) come from the backend; the bar is purely presentational
// and never lets the user adjust progress.

export function ContractProgress({
  value,
  label,
  milestoneText,
  className,
}: {
  /** 0–100 authoritative percentage. */
  value: number;
  label?: string;
  milestoneText?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={className}>
      {label && <p className="text-sm font-semibold text-kampmax-text">{label}</p>}
      {milestoneText && (
        <p className="mt-0.5 text-xs text-kampmax-text-secondary">{milestoneText}</p>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Project progress"}
        className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-kampmax-muted"
      >
        <div
          className="h-full rounded-full bg-primary-600 transition-[width] duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <p className="text-xs text-kampmax-text-secondary">
          {clamped}% complete
        </p>
      </div>
    </div>
  );
}

// A compact inline progress used inside list cards.
export function ContractProgressMini({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${clamped}% project progress`}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-kampmax-muted", className)}
    >
      <div
        className="h-full rounded-full bg-primary-600"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
