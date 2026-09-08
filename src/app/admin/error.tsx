"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-kampmax-border bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-kampmax-error/10">
          <AlertTriangle className="h-5 w-5 text-kampmax-error" />
        </div>
        <h1 className="mt-3 text-base font-semibold text-kampmax-text">
          Something went wrong
        </h1>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          This admin section failed to load. Your session is unaffected.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-kampmax-blue px-4 text-sm font-medium text-white transition-colors hover:bg-kampmax-blue-dark"
        >
          Try again
        </button>
      </div>
    </div>
  );
}