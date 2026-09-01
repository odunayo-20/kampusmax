"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Paged-order navigation. Renders nothing when there's a single page. */
export function BookingPagination({
  page,
  totalPages,
  total,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Bookings pagination" className="flex items-center justify-between gap-3">
      <p className="text-xs text-neutral-500">
        Page <span className="font-semibold text-neutral-700">{page}</span> of{" "}
        <span className="font-semibold text-neutral-700">{totalPages}</span> · {total}{" "}
        {total === 1 ? "booking" : "bookings"}
      </p>
      <div className="flex gap-1.5">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold",
            page <= 1
              ? "cursor-not-allowed text-neutral-300"
              : "text-neutral-700 hover:bg-neutral-50"
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> Previous
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold",
            page >= totalPages
              ? "cursor-not-allowed text-neutral-300"
              : "text-neutral-700 hover:bg-neutral-50"
          )}
        >
          Next <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </nav>
  );
}