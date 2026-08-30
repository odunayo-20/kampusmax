"use client";

import { cn } from "@/lib/utils";

/**
 * Loading skeletons for the service-provider dashboard. Variants mirror the
 * page shapes (dashboard cards, list rows, form fields, portfolio grid).
 */
export function ServiceProviderSkeleton({
  variant = "dashboard",
  count = 4,
}: {
  variant?: "dashboard" | "list" | "form" | "grid";
  count?: number;
}) {
  return (
    <div className="animate-pulse space-y-6" role="status" aria-label="Loading">
      {variant === "dashboard" && (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="h-8 w-56 rounded bg-neutral-200" />
            <div className="h-9 w-28 rounded-lg bg-neutral-200" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: count }).map((_, i) => (
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
        </>
      )}

      {variant === "list" &&
        Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border border-kampmax-border bg-white p-5">
            <div className="h-5 w-1/3 rounded bg-neutral-200" />
            <div className="mt-2 h-3 w-2/3 rounded bg-neutral-100" />
            <div className="mt-4 flex gap-2">
              <div className="h-8 w-20 rounded-md bg-neutral-100" />
              <div className="h-8 w-20 rounded-md bg-neutral-100" />
            </div>
          </div>
        ))}

      {variant === "form" && (
        <div className="rounded-xl border border-kampmax-border bg-white p-6">
          <div className="h-6 w-48 rounded bg-neutral-200" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="h-10 rounded-md bg-neutral-100" />
            <div className="h-10 rounded-md bg-neutral-100" />
            <div className="h-28 rounded-md bg-neutral-100 sm:col-span-2" />
            <div className="h-10 rounded-md bg-neutral-100" />
            <div className="h-10 rounded-md bg-neutral-100" />
          </div>
          <div className="mt-6 h-10 w-32 rounded-md bg-neutral-200" />
        </div>
      )}

      {variant === "grid" &&
        Array.from({ length: count }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-kampmax-border bg-white">
            <div className="aspect-[4/3] bg-neutral-200" />
            <div className="p-4">
              <div className="h-4 w-2/3 rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-neutral-100" />
            </div>
          </div>
        ))}

      <span className="sr-only">Loading…</span>
    </div>
  );
}