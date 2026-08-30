"use client";

interface ServiceCardSkeletonProps {
  className?: string;
}

/** Skeleton matching the ServiceCard dimensions. */
export function ServiceCardSkeleton({ className }: ServiceCardSkeletonProps) {
  return (
    <div className={`bg-white rounded-[10px] border border-neutral-200 overflow-hidden ${className ?? ""}`}>
      <div className="aspect-[4/3] bg-neutral-100 animate-pulse" />
      <div className="p-3 space-y-2.5">
        <div className="h-2.5 w-1/2 bg-neutral-100 animate-pulse rounded" />
        <div className="h-3.5 w-3/4 bg-neutral-100 animate-pulse rounded" />
        <div className="h-2.5 w-1/3 bg-neutral-100 animate-pulse rounded" />
        <div className="h-3.5 w-1/2 bg-neutral-100 animate-pulse rounded" />
        <div className="h-8 w-full bg-neutral-100 animate-pulse rounded-md mt-1" />
      </div>
    </div>
  );
}

/** Skeleton for a provider card. */
export function ProviderCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-white rounded-[10px] border border-neutral-200 p-4 ${className ?? ""}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 bg-neutral-100 animate-pulse rounded" />
          <div className="h-2.5 w-1/2 bg-neutral-100 animate-pulse rounded" />
        </div>
      </div>
      <div className="mt-3 h-2.5 w-full bg-neutral-100 animate-pulse rounded" />
      <div className="mt-1.5 h-2.5 w-3/4 bg-neutral-100 animate-pulse rounded" />
    </div>
  );
}