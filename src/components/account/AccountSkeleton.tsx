"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-200/70", className)}
    />
  );
}

/** Skeleton used while account data loads (avoids layout shift). */
export function AccountSkeleton({ kind }: { kind: "card" | "list" | "line" }) {
  if (kind === "card") {
    return (
      <div className="bg-white rounded-xl border border-kampmax-border p-5">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-7 w-16 mt-3" />
        <Skeleton className="h-3 w-24 mt-2" />
      </div>
    );
  }
  if (kind === "line") {
    return <Skeleton className="h-4 w-full" />;
  }
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-kampmax-border p-4 flex items-center gap-3"
        >
          <Skeleton className="h-11 w-11 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Full dashboard skeleton: summary cards + list. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <AccountSkeleton key={i} kind="card" />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-kampmax-border p-5">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
