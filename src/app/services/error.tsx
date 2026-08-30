"use client";

import { useEffect } from "react";
import { Wrench, RefreshCcw } from "lucide-react";

export default function ServicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center p-8 bg-white rounded-2xl border border-kampmax-border">
        <div className="w-16 h-16 mx-auto rounded-full bg-error-50 flex items-center justify-center mb-4">
          <Wrench className="h-8 w-8 text-error-600" />
        </div>
        <h1 className="text-xl font-bold text-kampmax-text mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-kampmax-text-secondary mb-6">
          We couldn&apos;t load this page. Please try again — your saved searches and
          filters are not lost.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
        >
          <RefreshCcw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}