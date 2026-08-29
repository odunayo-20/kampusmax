"use client";

import { cn } from "@/lib/utils";

export function CustomerListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-20 animate-pulse rounded-xl border border-kampmax-border bg-white" />
      <div className="h-12 animate-pulse rounded-lg border border-kampmax-border bg-white" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-16 animate-pulse rounded-xl border border-kampmax-border",
            i % 2 === 0 ? "bg-white" : "bg-kampmax-muted/40"
          )}
        />
      ))}
    </div>
  );
}

export function CustomerDetailSkeleton() {
  return (
    <div className="max-w-4xl space-y-4" aria-hidden>
      <div className="h-10 w-64 animate-pulse rounded-lg bg-white" />
      <div className="h-28 animate-pulse rounded-xl border border-kampmax-border bg-white" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-xl border border-kampmax-border bg-white" />
      ))}
    </div>
  );
}