"use client";

import { Skeleton } from "@/components/home/Skeleton";

export function EmployerProfileSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading employer profile">
      <div className="overflow-hidden rounded-xl border border-kampmax-border bg-white">
        <div className="h-20 w-full bg-neutral-100" />
        <div className="px-5 pb-5 sm:px-6">
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-6 w-56 max-w-full" />
              <Skeleton className="h-4 w-40 max-w-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}