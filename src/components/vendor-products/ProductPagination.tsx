"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

interface ProductPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function ProductPagination({ page, totalPages, total, pageSize, onPageChange }: ProductPaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-kampmax-border">
      <p className="text-sm text-kampmax-text-secondary">
        Showing {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()} products
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          Previous
        </Button>

        {visiblePages.map((p, i) => (
          <Button
            key={p}
            variant={p === page ? "primary" : "outline"}
            size="sm"
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className="min-w-[36px]"
          >
            {i > 0 && visiblePages[i - 1] !== p - 1 && <span className="mx-1 text-kampmax-text-secondary">…</span>}
            {p}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
}