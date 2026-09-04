"use client";

import { cn } from "@/lib/utils";

// Loading skeleton for the financials module (spec §43). No financial values
// appear here — only neutral placeholders, so no misleading numbers flash.

export function FlFinancialSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-kampmax-border bg-white p-4">
            <div className="h-4 w-24 rounded bg-neutral-200" />
            <div className="mt-4 h-8 w-32 rounded bg-neutral-200" />
            <div className="mt-2 h-3 w-20 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
      <div className="animate-pulse rounded-xl border border-kampmax-border bg-white p-4">
        <div className="h-5 w-32 rounded bg-neutral-200" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-24 rounded bg-neutral-200" />
              <div className="h-6 w-20 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
      <div className="animate-pulse rounded-xl border border-kampmax-border bg-white p-4">
        <div className="h-5 w-40 rounded bg-neutral-200" />
        <div className="mt-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded bg-neutral-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-neutral-200" />
                <div className="h-3 w-40 rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
