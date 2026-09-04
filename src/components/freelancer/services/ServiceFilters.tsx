"use client";

import { Search } from "lucide-react";
import { FREELANCER_SERVICE_FILTER_TABS } from "@/config/freelancer-services";
import type { FreelancerServiceStatus } from "@/types/freelancer-services";
import { cn } from "@/lib/utils";

type StatusFilter = FreelancerServiceStatus | "all";

/**
 * URL-synced status tabs + debounced search for the My Services list.
 * State lives in the query string (/freelancer/services?status=…&q=…) so the
 * active filter is shareable and survives reloads — matching Module 23/25
 * conventions.
 */
export function ServiceFilters({
  status,
  search,
  onStatusChange,
  onSearchChange,
  counts,
}: {
  status: StatusFilter;
  search: string;
  onStatusChange: (value: StatusFilter) => void;
  onSearchChange: (value: string) => void;
  counts: Record<StatusFilter, number>;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex -space-x-px overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          {FREELANCER_SERVICE_FILTER_TABS.map((tab) => {
            const active = status === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatusChange(tab.value)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap border-r border-neutral-200 px-3 py-2 text-xs font-medium last:border-r-0",
                  active
                    ? "bg-primary-600 text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-50"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]",
                    active ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"
                  )}
                >
                  {counts[tab.value]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search services…"
            aria-label="Search services"
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm shadow-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
          />
        </div>
      </div>
    </div>
  );
}
