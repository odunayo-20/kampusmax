"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  /** Row range shown when the list is non-empty, e.g. "1–10 of 67". */
  className?: string;
  /** Noun for the result summary line ("users", "reviews", …). Defaults to a neutral "results". */
  unitLabel?: string;
}

function pageWindow(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((p) => pages.add(p));

  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

/** Table footer: result summary + page size + numbered pager. */
export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  className,
  unitLabel = "results",
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 border-t border-kampmax-border px-4 py-3 sm:flex-row",
        className
      )}
    >
      <div className="flex items-center gap-3 text-xs text-kampmax-text-secondary">
        <span>
          Showing{" "}
          <span className="font-medium tabular-nums text-kampmax-text">
            {start}–{end}
          </span>{" "}
          of <span className="font-medium tabular-nums text-kampmax-text">{total.toLocaleString("en-NG")}</span>{" "}
          {unitLabel}
        </span>
        {onPageSizeChange && (
          <label className="ml-2 hidden items-center gap-1.5 sm:flex">
            Rows
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 rounded-md border border-kampmax-border bg-white px-1.5 py-0 text-xs font-medium text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
              aria-label="Rows per page"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <PagerButton
          label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </PagerButton>

        {pageWindow(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1.5 text-xs text-kampmax-text-secondary">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "h-8 min-w-8 rounded-md px-2 text-xs font-medium tabular-nums transition-colors",
                p === page
                  ? "bg-kampmax-navy text-white"
                  : "text-kampmax-text-secondary hover:bg-kampmax-muted hover:text-kampmax-text"
              )}
            >
              {p}
            </button>
          )
        )}

        <PagerButton
          label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </PagerButton>
      </nav>
    </div>
  );
}

function PagerButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border border-kampmax-border bg-white text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted hover:text-kampmax-text",
        disabled && "cursor-not-allowed opacity-40 hover:bg-white hover:text-kampmax-text-secondary"
      )}
    >
      {children}
    </button>
  );
}
