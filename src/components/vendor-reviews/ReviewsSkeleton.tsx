"use client";

export function ReviewsSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-24 animate-pulse rounded-xl border border-kampmax-border bg-white" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-xl border border-kampmax-border bg-white" />
      ))}
    </div>
  );
}