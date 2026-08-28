"use client";

import { cn } from "@/lib/utils";

interface ProductSkeletonProps {
  className?: string;
}

export function ProductSkeleton({ className }: ProductSkeletonProps) {
  return (
    <div className={cn("bg-white rounded-[10px] border border-neutral-200 overflow-hidden", className)}>
      <div className="aspect-[1/1] bg-neutral-100 animate-pulse" />
      <div className="p-3 space-y-3">
        <div className="h-3 w-3/4 bg-neutral-100 animate-pulse rounded" />
        <div className="h-3 w-1/2 bg-neutral-100 animate-pulse rounded" />
        <div className="h-4 w-1/3 bg-neutral-100 animate-pulse rounded mt-auto" />
      </div>
    </div>
  );
}