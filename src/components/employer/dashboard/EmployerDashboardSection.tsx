"use client";

import Link from "next/link";
import { Skeleton } from "@/components/home/Skeleton";
import type { EmployerDashboardSummary } from "@/services/employer-dashboard";

/**
 * Shared query-shaped input for dashboard sections. Every section reads its
 * slice from ONE summary query (the future dashboard endpoint), so loading,
 * error and empty states stay consistent and the page never fans out dozens
 * of requests.
 */
export interface EmployerDashboardQuerySource {
  data?: EmployerDashboardSummary | null;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function EmployerDashboardSection({
  title,
  action,
  id,
  children,
}: {
  title: string;
  action?: { href: string; label: string };
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={title.replace(/\s+/g, "-").toLowerCase()}
      id={id}
      className="rounded-xl border border-kampmax-border bg-white"
    >
      <header className="flex items-center justify-between gap-3 border-b border-kampmax-border/70 px-4 pt-4 pb-3 sm:px-5">
        <h2 className="text-sm font-bold text-kampmax-text">{title}</h2>
        {action && (
          <Link
            href={action.href}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
          >
            {action.label}
          </Link>
        )}
      </header>
      <div className="px-4 py-4 sm:px-5">{children}</div>
    </section>
  );
}

export function EmployerDashboardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function EmployerDashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-5 text-center">
      <p className="text-sm font-medium text-error-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
      >
        Try again
      </button>
    </div>
  );
}

export function EmployerDashboardEmpty({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-kampmax-border bg-kampmax-bg px-4 py-6 text-center">
      <p className="text-sm font-semibold text-kampmax-text">{title}</p>
      {detail && <p className="mt-1 text-xs text-kampmax-text-secondary">{detail}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}