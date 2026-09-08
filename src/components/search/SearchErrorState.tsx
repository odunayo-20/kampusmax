"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface SearchErrorStateProps {
  message: string;
  onRetry: () => void;
  className?: string;
}

/**
 * Mapped error shown when the search query fails (spec §21 — friendly
 * message, e.g. from getFriendlyErrorMessage; never a raw stack trace).
 */
export function SearchErrorState({
  message,
  onRetry,
  className,
}: SearchErrorStateProps) {
  return (
    <div className={cn("py-10 text-center", className)} role="alert">
      <div className="mx-auto w-12 h-12 rounded-full bg-error-50 flex items-center justify-center mb-4">
        <AlertTriangle className="h-6 w-6 text-error-500" />
      </div>
      <h2 className="text-base font-semibold text-neutral-900">
        Something went wrong
      </h2>
      <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">{message}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}