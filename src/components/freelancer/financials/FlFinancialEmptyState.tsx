"use client";

import { Inbox, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

// Empty state (spec §44) — informational, no fabricated money values.
export function FlFinancialEmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-kampmax-border bg-kampmax-muted/40 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-kampmax-muted">
        <Inbox className="h-6 w-6 text-kampmax-text-secondary" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold text-kampmax-text">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-kampmax-text-secondary">{message}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Error state (spec §45) — backend error surfaced with a retry affordance.
export function FlFinancialErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-error-100 bg-error-50/40 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-100">
        <AlertTriangle className="h-6 w-6 text-error-700" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold text-kampmax-text">Could not load your finances</h3>
      <p className="mt-1 max-w-sm text-sm text-error-700">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden /> Try again
        </Button>
      )}
    </div>
  );
}
