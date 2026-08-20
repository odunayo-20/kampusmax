"use client";

import { cn } from "@/lib/utils";

export function ProductSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-kampmax-border overflow-hidden animate-pulse",
        className
      )}
    >
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}
