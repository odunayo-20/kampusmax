"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this data. Check your connection and try again.",
  onRetry,
  className,
  compact,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-kampmax-border bg-white text-center",
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-14",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kampmax-error/10">
        <AlertTriangle className="h-5 w-5 text-kampmax-error" />
      </div>
      <div>
        <p className={cn("font-semibold text-kampmax-text", compact ? "text-sm" : "text-base")}>
          {title}
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs text-kampmax-text-secondary sm:text-sm">
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            "mt-1 inline-flex items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60",
            compact ? "h-8 text-xs" : "h-9 text-sm"
          )}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
