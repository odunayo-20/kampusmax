"use client";

import { Button } from "@/components/ui";

interface VendorPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

export function VendorPagination({ page, totalPages, total, pageSize, itemLabel, onPageChange }: VendorPaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages: (number | "ellipsis")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-kampmax-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-kampmax-text-secondary">
        Showing {start.toLocaleString("en-NG")}–{end.toLocaleString("en-NG")} of {total.toLocaleString("en-NG")} {itemLabel}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page">
          Previous
        </Button>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-kampmax-text-secondary">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "primary" : "outline"}
              size="sm"
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className="min-w-[36px]"
            >
              {p}
            </Button>
          )
        )}
        <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next page">
          Next
        </Button>
      </div>
    </div>
  );
}