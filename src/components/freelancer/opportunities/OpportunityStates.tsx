"use client";

import { SearchX, AlertCircle, Bookmark, Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Skeleton } from "@/components/home/Skeleton";

export function OpportunityGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading opportunities">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-2/3" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OpportunityEmptyState({
  hasFilters,
  onReset,
  saved,
}: {
  hasFilters: boolean;
  onReset?: () => void;
  saved?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        {saved ? (
          <Bookmark className="h-7 w-7" aria-hidden />
        ) : (
          <SearchX className="h-7 w-7" aria-hidden />
        )}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-neutral-900">
        {saved ? "No saved jobs" : "No matching opportunities"}
      </h3>
      <p className="mt-1 max-w-xs text-xs text-neutral-500">
        {saved
          ? "Jobs you save will appear here so you can come back to them later."
          : "Try changing your search or clearing your filters."}
      </p>
      {(hasFilters || saved) && onReset && (
        <div className="mt-4">
          <Button variant="outline" onClick={onReset}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

export function OpportunityErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-50 text-error-600">
        <AlertCircle className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-neutral-900">Something went wrong</h3>
      <p className="mt-1 max-w-xs text-xs text-neutral-500">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

export function FindWorkHeader({ count }: { count: number }) {
  return (
    <div>
      <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-900">
        <Briefcase className="h-5 w-5 text-primary-600" aria-hidden />
        Find Work
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Discover opportunities that match your skills and experience.
        {count > 0 ? ` ${count} open ${count === 1 ? "job" : "jobs"} available.` : ""}
      </p>
    </div>
  );
}

export function SavedJobsHeader({ count }: { count: number }) {
  return (
    <div>
      <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-900">
        <Bookmark className="h-5 w-5 text-primary-600" aria-hidden />
        Saved Jobs
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {count > 0
          ? `You've saved ${count} ${count === 1 ? "job" : "jobs"}.`
          : "Bookmark jobs you're interested in to find them here later."}
      </p>
    </div>
  );
}
