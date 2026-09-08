"use client";

import { cn } from "@/lib/utils";

/**
 * Loading state shown while a search query is fetching. Keeps the layout
 * stable (spec §35 — no empty flicker): same section header + card grid the
 * real results render into, replaced by neutral pulse blocks.
 */
export function SearchResultsSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("space-y-8", className)} role="status" aria-label="Loading search results">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-neutral-100 animate-pulse" />
          <div className="h-3 w-24 rounded bg-neutral-100 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-neutral-100 animate-pulse"
              style={{ height: 240 }}
            />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-neutral-100 animate-pulse" />
          <div className="h-3 w-24 rounded bg-neutral-100 animate-pulse" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}