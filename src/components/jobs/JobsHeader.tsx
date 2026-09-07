"use client";

import { Briefcase } from "lucide-react";

/**
 * Jobs Marketplace header. Count is the total open jobs served by the
 * backend for the current filter set.
 */
export function JobsHeader({ count }: { count: number }) {
  return (
    <div>
      <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-900">
        <Briefcase className="h-5 w-5 text-primary-600" aria-hidden />
        Jobs Marketplace
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Browse open jobs posted across Kampmax campus communities.
        {count > 0 ? ` ${count} open ${count === 1 ? "job" : "jobs"} matching your filters.` : ""}
      </p>
    </div>
  );
}