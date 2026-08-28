"use client";

import { cn } from "@/lib/utils";

interface ProductGridProps {
  children: React.ReactNode;
  viewMode?: "grid" | "list";
  className?: string;
}

export function ProductGrid({ children, viewMode = "grid", className }: ProductGridProps) {
  if (viewMode === "list") {
    return (
      <div className={cn("space-y-3", className)} role="list">
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-3 md:gap-4",
        "grid-cols-2",
        "md:grid-cols-3",
        "lg:grid-cols-4",
        className
      )}
      role="list"
    >
      {children}
    </div>
  );
}