"use client";

import { cn } from "@/lib/utils";

interface NotificationSkeletonProps {
  count?: number;
  compact?: boolean;
}

/**
 * Shimmering placeholder rows shown while the notification feed loads,
 * so the bell dropdown and notification center never flash empty.
 */
export function NotificationSkeleton({
  count = 5,
  compact,
}: NotificationSkeletonProps) {
  return (
    <div className="divide-y divide-kampmax-border" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex items-start gap-3 animate-pulse",
            compact ? "px-3 py-2.5" : "px-4 py-3.5"
          )}
        >
          <span className="w-10 h-10 rounded-xl bg-kampmax-muted flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "h-3.5 rounded bg-kampmax-muted",
                  compact ? "w-24" : "w-40"
                )}
              />
              <span className="h-2.5 w-10 rounded bg-kampmax-muted/60 flex-shrink-0" />
            </div>
            <span className="block h-2.5 rounded bg-kampmax-muted/70 max-w-[85%]" />
          </div>
        </div>
      ))}
    </div>
  );
}