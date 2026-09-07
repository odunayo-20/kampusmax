"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";

/**
 * Shared page-number pagination for the jobs marketplace. Mirrors the
 * Find Work pagination but with current/total feedback for screen readers.
 */
export function JobsPagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-between border-t border-neutral-200 pt-4"
      aria-label="Job pagination"
    >
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="mr-1 h-4 w-4" aria-hidden /> Previous
      </Button>
      <p className="text-xs text-neutral-500">
        Page {page} of {totalPages} · {total} {total === 1 ? "job" : "jobs"}
      </p>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
      </Button>
    </nav>
  );
}