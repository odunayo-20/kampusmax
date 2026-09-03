"use client";

import { CalendarDays, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FreelancerDashAvailability } from "@/types/freelancer-dashboard";

/** Current availability as reported by the backend. Read-only — the ability to
 * update availability is a future module, so it's surfaced here as a status. */
export function FreelancerAvailability({ status, label }: { status: FreelancerDashAvailability | null; label: string }) {
  const dot =
    status === "available"
      ? "bg-success-500"
      : status === "available_later"
      ? "bg-warning-500"
      : "bg-neutral-400";

  return (
    <section
      aria-label="Availability"
      className="rounded-xl border border-kampmax-border bg-white p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-kampmax-text-secondary" aria-hidden />
          <h2 className="text-sm font-bold text-kampmax-text">Availability</h2>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
            status === "available"
              ? "bg-success-50 text-success-700 ring-success-200"
              : status === "available_later"
              ? "bg-warning-50 text-warning-700 ring-warning-200"
              : "bg-neutral-100 text-neutral-700 ring-neutral-200"
          )}
        >
          <CircleDot className={cn("h-3.5 w-3.5", dot)} aria-hidden />
          {label}
        </span>
      </div>
      <p className="mt-2 text-xs text-kampmax-text-muted">
        Managing availability hours is coming in a future release.
      </p>
    </section>
  );
}
