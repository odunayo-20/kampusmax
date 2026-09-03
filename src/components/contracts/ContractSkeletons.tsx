"use client";

// Skeleton loaders for the contracts module — never show a blank page while
// data loads.

export function ContractListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-kampmax-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-kampmax-border bg-white p-5"
          >
            <div className="h-4 w-3/4 rounded bg-kampmax-muted" />
            <div className="mt-2 h-3 w-1/2 rounded bg-kampmax-muted" />
            <div className="mt-4 h-2 w-full rounded bg-kampmax-muted" />
            <div className="mt-4 h-16 w-full rounded bg-kampmax-muted" />
            <div className="mt-4 h-4 w-2/3 rounded bg-kampmax-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContractDetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="animate-pulse">
        <div className="h-8 w-1/2 rounded bg-kampmax-muted" />
        <div className="mt-2 h-4 w-1/3 rounded bg-kampmax-muted" />
      </div>
      <div className="animate-pulse rounded-xl border border-kampmax-border bg-white p-5">
        <div className="h-5 w-1/4 rounded bg-kampmax-muted" />
        <div className="mt-3 h-4 w-full rounded bg-kampmax-muted" />
        <div className="mt-2 h-4 w-2/3 rounded bg-kampmax-muted" />
      </div>
      <div className="grid gap-4 animate-pulse lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-kampmax-border bg-white p-5">
            <div className="h-5 w-1/3 rounded bg-kampmax-muted" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full rounded bg-kampmax-muted" />
              <div className="h-3 w-5/6 rounded bg-kampmax-muted" />
              <div className="h-3 w-4/6 rounded bg-kampmax-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
