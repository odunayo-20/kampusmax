"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServicePaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

/**
 * Page-based pagination. Keeps a compact window of page buttons and always
 * offers previous/next, with disabled states at the boundaries.
 */
export function ServicePagination({ page, totalPages, onChange, className }: ServicePaginationProps) {
  if (totalPages <= 1) return null;

  function windowPages(): (number | "ellipsis")[] {
    const result: (number | "ellipsis")[] = [];
    const push = (p: number) => result.push(p);
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) push(i);
      return result;
    }
    push(1);
    if (page > 3) result.push("ellipsis");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) push(i);
    if (page < totalPages - 2) result.push("ellipsis");
    push(totalPages);
    return result;
  }

  const pages = windowPages();

  return (
    <nav className={cn("flex items-center justify-center gap-1.5 pt-2", className)} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="h-9 px-2.5 rounded-md border border-neutral-200 bg-white text-neutral-700 text-sm font-medium hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e${i}`} className="px-1 text-neutral-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={cn(
              "h-9 w-9 rounded-md text-sm font-medium transition-colors",
              p === page
                ? "bg-primary-600 text-white"
                : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="h-9 px-2.5 rounded-md border border-neutral-200 bg-white text-neutral-700 text-sm font-medium hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}