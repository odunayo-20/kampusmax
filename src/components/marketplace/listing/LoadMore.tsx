"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

interface LoadMoreProps {
  hasMore: boolean;
  onLoadMore: () => void;
  loading?: boolean;
  remainingCount?: number;
  className?: string;
}

export function LoadMore({ hasMore, onLoadMore, loading, remainingCount, className }: LoadMoreProps) {
  if (!hasMore) return null;

  return (
    <div className={cn("flex justify-center pt-4", className)}>
      <Button
        onClick={onLoadMore}
        disabled={loading}
        variant="outline"
        className="border-neutral-200 hover:border-neutral-300"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : (
          <>
            Load more
            {remainingCount && <span className="ml-2 text-xs text-neutral-500">({remainingCount} remaining)</span>}
          </>
        )}
      </Button>
    </div>
  );
}