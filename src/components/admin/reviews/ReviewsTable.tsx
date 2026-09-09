"use client";

import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BadgeCheck,
  Flag,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";
import { cn, formatDate, timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import type { ManagedReviewRow, Paginated, SortDir } from "@/types/admin";
import type { ManagedReviewSortField } from "@/services/admin";
import { StarRating } from "./StarRating";
import {
  ReviewSourceBadge,
  ReviewStatusBadge,
  ReviewTargetTypeBadge,
} from "./ReviewBadges";

interface ReviewsTableProps {
  page: Paginated<ManagedReviewRow> | null;
  loading: boolean;
  error: boolean;
  sortBy: ManagedReviewSortField;
  sortDir: SortDir;
  onSort: (field: ManagedReviewSortField) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function ReviewsTable({
  page,
  loading,
  error,
  sortBy,
  sortDir,
  onSort,
  onRetry,
  hasActiveFilters,
  onClearFilters,
}: ReviewsTableProps) {
  const router = useRouter();

  if (loading && !page) {
    return <LoadingSkeleton variant="table" rows={6} />;
  }

  if (error && !page) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (!page || page.items.length === 0) {
    return (
      <div className="rounded-lg border border-kampmax-border bg-white p-4">
        <EmptyState
          title="No reviews found"
          message={
            hasActiveFilters
              ? "No reviews match the current search and filters."
              : "Reviews left on products, stores and profiles will appear here."
          }
          action={
            hasActiveFilters ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex h-9 items-center rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-kampmax-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1360px] text-sm">
          <thead>
            <tr className="border-b border-kampmax-border bg-kampmax-muted/50 text-left text-xs uppercase tracking-wide text-kampmax-text-secondary">
              <Th>Review</Th>
              <Th>Target</Th>
              <SortableTh
                label="Rating"
                active={sortBy === "rating"}
                dir={sortDir}
                onClick={() => onSort("rating")}
              />
              <SortableTh
                label="Helpful"
                active={sortBy === "helpful"}
                dir={sortDir}
                onClick={() => onSort("helpful")}
                className="hidden xl:table-cell"
              />
              <Th>Status</Th>
              <Th className="hidden xl:table-cell">Signals</Th>
              <SortableTh
                label="Reports"
                active={sortBy === "reported"}
                dir={sortDir}
                onClick={() => onSort("reported")}
              />
              <SortableTh
                label="Created"
                active={sortBy === "createdAt"}
                dir={sortDir}
                onClick={() => onSort("createdAt")}
              />
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border/70">
            {page.items.map((review) => (
              <Row
                key={review.id}
                review={review}
                onOpen={() => router.push(`/admin/reviews/${review.id}`)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {page.items.length} of {page.total} reviews, page {page.page} of{" "}
        {page.totalPages}.
      </p>
    </div>
  );
}

// ------------------------------------------------------------
// Header cells
// ------------------------------------------------------------

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn("whitespace-nowrap px-4 py-2.5 font-medium", className)}
    >
      {children}
    </th>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className={cn("px-4 py-2.5 font-medium", className)}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 whitespace-nowrap uppercase tracking-wide transition-colors hover:text-kampmax-text",
          active && "text-kampmax-text"
        )}
      >
        {label}
        <Icon
          className={cn("h-3 w-3", active ? "text-kampmax-blue" : "opacity-50")}
        />
      </button>
    </th>
  );
}

// ------------------------------------------------------------
// Rows
// ------------------------------------------------------------

function Row({ review, onOpen }: { review: ManagedReviewRow; onOpen: () => void }) {
  const initials = initialsOf(review.reviewerName);
  return (
    <tr className="group transition-colors hover:bg-kampmax-muted/40">
      {/* Review */}
      <td className="max-w-[280px] px-4 py-2.5">
        <button
          type="button"
          onClick={onOpen}
          title={`Open review by ${review.reviewerName}`}
          className="flex w-full items-start gap-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-kampmax-blue"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kampmax-muted text-xs font-semibold text-kampmax-text-secondary">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium text-kampmax-text group-hover:text-kampmax-blue">
              {review.reviewerName}
            </span>
            <span className="block font-mono text-[10px] uppercase text-kampmax-text-secondary/70">
              {review.id}
            </span>
            <span className="mt-1 block line-clamp-2 text-xs leading-snug text-kampmax-text-secondary">
              {review.commentPreview}
            </span>
          </span>
        </button>
      </td>

      {/* Target */}
      <td className="max-w-[190px] px-4 py-2.5">
        <span className="flex items-center gap-1.5">
          <ReviewTargetTypeBadge type={review.targetType} />
        </span>
        <span
          className="mt-1 block truncate text-[13px] font-medium text-kampmax-text"
          title={review.targetName}
        >
          {review.targetName}
        </span>
        <span className="block truncate font-mono text-[10px] text-kampmax-text-secondary/70">
          {review.targetId}
        </span>
      </td>

      {/* Rating */}
      <td className="whitespace-nowrap px-4 py-2.5">
        <StarRating rating={review.rating} />
      </td>

      {/* Helpful */}
      <td className="hidden whitespace-nowrap px-4 py-2.5 tabular-nums text-kampmax-text-secondary xl:table-cell">
        {review.helpfulCount.toLocaleString("en-NG")}
      </td>

      {/* Status */}
      <td className="px-4 py-2.5">
        <div className="flex flex-col items-start gap-1">
          <ReviewStatusBadge status={review.status} />
          <ReviewSourceBadge source={review.statusSource} />
        </div>
      </td>

      {/* Signals */}
      <td className="hidden px-4 py-2.5 xl:table-cell">
        <div className="flex flex-wrap items-center gap-1.5">
          {review.verifiedPurchase ? (
            <span
              className="inline-flex items-center gap-1 text-xs font-medium text-kampmax-success"
              title={review.orderId ? `Order ${review.orderId}` : "Verified"}
            >
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              Verified
            </span>
          ) : (
            <span className="text-xs text-kampmax-text-secondary">Unverified</span>
          )}
          {review.withImages && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-kampmax-muted px-2 py-0.5 text-[11px] font-medium text-kampmax-text-secondary"
              title="Includes photos"
            >
              <ImageIcon className="h-3 w-3" aria-hidden />
              Photos
            </span>
          )}
          {review.hasResponse ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-kampmax-blue/10 px-2 py-0.5 text-[11px] font-medium text-kampmax-blue"
              title="Vendor has responded"
            >
              <MessageSquare className="h-3 w-3" aria-hidden />
              Responded
            </span>
          ) : review.targetType === "product" || review.targetType === "vendor" ? (
            <span className="text-[11px] text-kampmax-text-secondary/70">No response</span>
          ) : null}
        </div>
      </td>

      {/* Reports */}
      <td className="whitespace-nowrap px-4 py-2.5">
        {review.reportedCount > 0 ? (
          <span className="inline-flex items-center gap-1 font-medium tabular-nums text-kampmax-error">
            <Flag className="h-3 w-3" aria-hidden />
            {review.reportedCount}
          </span>
        ) : (
          <span className="tabular-nums text-kampmax-text-secondary">-</span>
        )}
      </td>

      {/* Created */}
      <td
        className="whitespace-nowrap px-4 py-2.5 tabular-nums text-kampmax-text-secondary"
        title={new Date(review.createdAt).toISOString()}
      >
        {formatDate(review.createdAt)}
        <span className="ml-1.5 hidden text-[11px] 2xl:inline">{timeAgo(review.createdAt)}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-2.5 text-right">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-8 items-center rounded-md border border-kampmax-border bg-white px-2.5 text-xs font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted"
        >
          View
        </button>
      </td>
    </tr>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}