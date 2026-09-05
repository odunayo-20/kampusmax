"use client";

import { FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { Skeleton } from "@/components/home/Skeleton";

export function ProposalGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading proposals">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-2 h-4 w-4/5" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProposalEmptyState({
  hasFilters,
  onReset,
}: {
  hasFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <FileText className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-neutral-900">
        {hasFilters ? "No proposals in this filter" : "No proposals yet"}
      </h3>
      <p className="mt-1 max-w-xs text-xs text-neutral-500">
        {hasFilters
          ? "Try a different status filter."
          : "Submit a proposal to an opportunity and it will appear here."}
      </p>
      {hasFilters ? (
        <div className="mt-4">
          <Button variant="outline" onClick={onReset}>
            Clear filter
          </Button>
        </div>
      ) : (
        <div className="mt-4">
          <a
            href="/freelancer/find-work"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1258C7]"
          >
            Find work
          </a>
        </div>
      )}
    </div>
  );
}

export function ProposalErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-50 text-error-600">
        <AlertCircle className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-neutral-900">Something went wrong</h3>
      <p className="mt-1 max-w-xs text-xs text-neutral-500">{message}</p>
      <div className="mt-4">
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

export function MyProposalsHeader({ count }: { count: number }) {
  return (
    <div>
      <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-900">
        <FileText className="h-5 w-5 text-primary-600" aria-hidden />
        My Proposals
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {count > 0 ? `You've submitted ${count} ${count === 1 ? "proposal" : "proposals"}.` : "Track and manage your proposals."}
      </p>
    </div>
  );
}
