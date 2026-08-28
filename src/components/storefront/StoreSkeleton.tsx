"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-neutral-200/70", className)} />
  );
}

/** Skeleton for the storefront header (cover + identity). */
export function StoreHeaderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-kampmax-border overflow-hidden">
      <Skeleton className="h-40 sm:h-56 w-full rounded-none" />
      <div className="px-4 sm:px-6 pb-6 -mt-8">
        <Skeleton className="h-20 w-20 rounded-2xl ring-4 ring-white" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton for the storefront nav. */
export function StoreNavSkeleton() {
  return (
    <div className="flex gap-2">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-9 w-20 rounded-lg" />
      ))}
    </div>
  );
}

/** Skeleton product grid. */
export function StoreProductsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-kampmax-border overflow-hidden">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
