"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StoreError({
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
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-sm font-semibold text-kampmax-error">Something went wrong</p>
      <h1 className="mt-2 text-2xl font-bold text-kampmax-text">
        We could not load this store
      </h1>
      <p className="mt-2 max-w-md text-sm text-kampmax-text-secondary">
        An unexpected error occurred while loading this store page. Please try
        again.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-kampmax-blue px-4 py-2 text-sm font-medium text-white hover:bg-kampmax-navy"
        >
          Try again
        </button>
        <Link
          href="/marketplace"
          className="rounded-lg border border-kampmax-border px-4 py-2 text-sm font-medium text-kampmax-text hover:bg-kampmax-muted"
        >
          Back to marketplace
        </Link>
      </div>
    </div>
  );
}
