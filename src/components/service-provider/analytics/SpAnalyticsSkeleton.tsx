"use client";

import { cn } from "@/lib/utils";

interface SpAnalyticsSkeletonProps {
  className?: string;
}

export function SpAnalyticsSkeleton({ className }: SpAnalyticsSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="h-8 w-48 rounded bg-neutral-200 animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl border border-kampmax-border bg-white p-4 animate-pulse">
            <div className="h-4 w-24 rounded bg-neutral-200" />
            <div className="mt-4 h-8 w-28 rounded bg-neutral-200" />
            <div className="mt-2 h-3 w-20 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-kampmax-border bg-white p-4 animate-pulse">
          <div className="h-10 w-36 rounded bg-neutral-200" />
          <div className="mt-4 h-40 rounded bg-neutral-200" />
        </div>
        <div className="rounded-xl border border-kampmax-border bg-white p-4 animate-pulse">
          <div className="h-10 w-36 rounded bg-neutral-200" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-3/4 rounded bg-neutral-200" />
            <div className="h-4 w-2/3 rounded bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
