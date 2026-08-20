import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-kampmax-muted rounded animate-pulse", className)} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-kampmax-border overflow-hidden">
      <Skeleton className="aspect-square" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function ProductCardHorizontalSkeleton() {
  return (
    <div className="flex-shrink-0 w-[160px] bg-white rounded-lg border border-kampmax-border overflow-hidden">
      <Skeleton className="aspect-square" />
      <div className="p-2 space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function VendorCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[200px] bg-white rounded-lg border border-kampmax-border p-3">
      <div className="flex items-center gap-2.5 mb-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-4 w-14 rounded" />
        <Skeleton className="h-4 w-12 rounded" />
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[260px] bg-white rounded-lg border border-kampmax-border p-3 space-y-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-kampmax-border">
      <Skeleton className="h-8 w-8 rounded" />
      <Skeleton className="h-3 w-14" />
      <Skeleton className="h-2.5 w-10" />
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-kampmax-border p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3.5 w-16" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </div>
  );
}

export { Skeleton };
