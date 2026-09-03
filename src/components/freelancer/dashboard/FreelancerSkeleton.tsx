"use client";

/**
 * Loading skeleton for the freelancer dashboard. Mirrors the page shape:
 * welcome header, metric cards, then a two-column overview.
 */
export function FreelancerSkeleton() {
  return (
    <div className="animate-pulse space-y-6" role="status" aria-label="Loading">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="h-8 w-64 rounded bg-neutral-200" />
        <div className="h-10 w-40 rounded-lg bg-neutral-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-kampmax-border bg-white p-4">
            <div className="mb-4 h-9 w-9 rounded-lg bg-neutral-200" />
            <div className="h-5 w-16 rounded bg-neutral-200" />
            <div className="mt-2 h-3 w-24 rounded bg-neutral-100" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-72 rounded-xl border border-kampmax-border bg-white lg:col-span-2" />
        <div className="h-72 rounded-xl border border-kampmax-border bg-white" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
