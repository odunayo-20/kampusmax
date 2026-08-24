"use client";

import {
  BadgeCheck,
  Eye,
  EyeOff,
  Flag,
  RotateCcw,
  SearchCheck,
  ShieldOff,
  UserRound,
} from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { communityCampusName, previewText } from "@/components/admin/campus-community/campus-community-utils";
import {
  AuthorCell,
  CommunitySectionShell,
  RowMenu,
} from "@/components/admin/campus-community/shared";
import { cn, formatDateShort, timeAgo } from "@/lib/utils";
import { StarRating } from "./StarRating";
import {
  reviewActionsFor,
  reviewStatusLabel,
  reviewStatusVariant,
  reviewTargetTypeLabel,
} from "./reviews-meta";
import type { ManagedReview } from "@/types/admin";

export interface ReviewsTableProps {
  items: ManagedReview[];
  loading: boolean;
  error: boolean;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  onView: (r: ManagedReview) => void;
  onHide: (r: ManagedReview) => void;
  onRestore: (r: ManagedReview) => void;
  onRemove: (r: ManagedReview) => void;
  onInvestigate: (r: ManagedReview) => void;
}

export function reviewsActionsFor(r: ManagedReview) {
  return reviewActionsFor(r);
}

export function ReviewsTable(props: ReviewsTableProps) {
  const {
    items,
    loading,
    error,
    hasActiveFilters,
    onRetry,
    onClearFilters,
    onView,
    onHide,
    onRestore,
    onRemove,
    onInvestigate,
  } = props;

  function menuActions(r: ManagedReview) {
    const a = reviewActionsFor(r);
    return [
      { key: "view", label: "View review", icon: Eye, onSelect: () => onView(r) },
      ...(a.investigate
        ? [
            {
              key: "investigate",
              label: `Investigate report${r.reportsCount === 1 ? "" : "s"}`,
              icon: SearchCheck,
              onSelect: () => onInvestigate(r),
            },
          ]
        : []),
      ...(a.hide
        ? [{ key: "hide", label: "Hide", icon: EyeOff, onSelect: () => onHide(r) }]
        : []),
      ...(a.restore
        ? [
            {
              key: "restore",
              label: "Restore",
              icon: RotateCcw,
              onSelect: () => onRestore(r),
            },
          ]
        : []),
      ...(a.remove
        ? [
            {
              key: "remove",
              label: "Remove",
              icon: ShieldOff,
              danger: true,
              onSelect: () => onRemove(r),
            },
          ]
        : []),
      {
        key: "reviewer",
        label: "View reviewer",
        icon: UserRound,
        onSelect: () => onView(r),
      },
    ];
  }

  return (
    <CommunitySectionShell
      loading={loading}
      error={error}
      isEmpty={items.length === 0}
      hasActiveFilters={hasActiveFilters}
      emptyTitle="No reviews found"
      emptyMessage="Product and vendor reviews will appear here as students leave feedback."
      onRetry={onRetry}
      onClearFilters={onClearFilters}
    >
      {/* Desktop / tablet: full table */}
      <div className="hidden overflow-hidden rounded-lg border border-kampmax-border bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead>
              <tr className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
                <th scope="col" className="px-4 py-2.5 font-medium">Reviewer</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Product</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">Vendor</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Rating</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Review</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium xl:table-cell">Campus</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium xl:table-cell">Purchase</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Reports</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium md:table-cell">Date</th>
                <th scope="col" className="w-10 px-2 py-2.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kampmax-border">
              {items.map((r) => {
                return (
                  <tr
                    key={r.id}
                    className="cursor-pointer transition-colors hover:bg-kampmax-muted/40"
                    onClick={() => onView(r)}
                  >
                    <td className="max-w-[150px] px-4 py-2.5">
                      <AuthorCell name={r.reviewer.name} />
                      <span className="mt-0.5 block font-mono text-[10px] uppercase text-kampmax-text-secondary/70">
                        {r.id}
                      </span>
                    </td>

                    <td className="max-w-[190px] px-3 py-2.5">
                      <span
                        className="block truncate font-medium text-kampmax-text"
                        title={r.targetTitle}
                      >
                        {r.targetTitle}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wide text-kampmax-text-secondary">
                        {reviewTargetTypeLabel(r.targetType)} review
                      </span>
                    </td>

                    <td className="hidden max-w-[140px] truncate whitespace-nowrap px-3 py-2.5 text-kampmax-text-secondary lg:table-cell">
                      {r.vendorName}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5">
                      <StarRating rating={r.rating} />
                    </td>

                    <td className="max-w-[260px] px-3 py-2.5">
                      <p
                        className="line-clamp-2 text-[13px] leading-snug text-kampmax-text"
                        title={r.comment}
                      >
                        {previewText(r.comment, 110)}
                      </p>
                    </td>

                    <td className="hidden whitespace-nowrap px-3 py-2.5 text-kampmax-text-secondary xl:table-cell">
                      {communityCampusName(r.campusId)}
                    </td>

                    {/* Verified purchase */}
                    <td className="hidden whitespace-nowrap px-3 py-2.5 xl:table-cell">
                      {r.verifiedPurchase ? (
                        <span
                          className="inline-flex items-center gap-1 text-xs font-medium text-kampmax-success"
                          title={`Order ${r.orderRef}`}
                        >
                          <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                          Verified
                        </span>
                      ) : (
                        <span className="text-xs text-kampmax-text-secondary">
                          Unverified
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5">
                      {r.reportsCount > 0 ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 font-medium tabular-nums",
                            r.status === "reported" || r.status === "under_review"
                              ? "text-kampmax-error"
                              : "text-amber-600"
                          )}
                        >
                          <Flag className="h-3 w-3" aria-hidden />
                          {r.reportsCount}
                        </span>
                      ) : (
                        <span className="text-kampmax-text-secondary">-</span>
                      )}
                    </td>

                    <td className="px-3 py-2.5">
                      <StatusBadge
                        variant={reviewStatusVariant(r.status)}
                        label={reviewStatusLabel(r.status)}
                      />
                    </td>

                    <td
                      className="hidden whitespace-nowrap px-3 py-2.5 tabular-nums text-kampmax-text-secondary md:table-cell"
                      title={new Date(r.createdAt).toISOString()}
                    >
                      {formatDateShort(r.createdAt)}
                      <span className="ml-1.5 hidden text-[11px] 2xl:inline">
                        {timeAgo(r.createdAt)}
                      </span>
                    </td>

                    <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <RowMenu label={`review ${r.id}`} actions={menuActions(r)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="space-y-2.5 md:hidden">
        {items.map((r) => (
          <li
            key={r.id}
            onClick={() => onView(r)}
            className="cursor-pointer rounded-lg border border-kampmax-border bg-white p-3 transition-colors active:bg-kampmax-muted/50"
          >
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="min-w-0 truncate text-left text-sm font-medium text-kampmax-blue"
              >
                {r.reviewer.name}
              </button>
              <StatusBadge
                variant={reviewStatusVariant(r.status)}
                label={reviewStatusLabel(r.status)}
              />
            </div>

            <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-kampmax-text">
              {previewText(r.comment, 130)}
            </p>

            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-dashed border-kampmax-border pt-2 text-xs">
              <MetaCell label="Product">
                <span className="truncate">{r.targetTitle}</span>
              </MetaCell>
              <MetaCell label="Vendor">
                <span className="truncate">{r.vendorName}</span>
              </MetaCell>
              <MetaCell label="Rating">
                <StarRating rating={r.rating} showValue={false} size="xs" />
              </MetaCell>
              <MetaCell label="Campus">
                {communityCampusName(r.campusId)}
              </MetaCell>
            </dl>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-kampmax-border pt-2">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-kampmax-text-secondary">
                {r.verifiedPurchase ? (
                  <span className="inline-flex items-center gap-1 font-medium text-kampmax-success">
                    <BadgeCheck className="h-3 w-3" aria-hidden />
                    Verified · {r.orderRef}
                  </span>
                ) : (
                  <span>Unverified purchase</span>
                )}
                {r.reportsCount > 0 && (
                  <span className="inline-flex items-center gap-1 font-medium text-kampmax-error">
                    <Flag className="h-3 w-3" aria-hidden />
                    {r.reportsCount}
                  </span>
                )}
                <span>{timeAgo(r.createdAt)}</span>
              </div>
              <div
                className="flex shrink-0 items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {reviewActionsFor(r).hide && (
                  <button
                    type="button"
                    title="Hide review"
                    onClick={() => onHide(r)}
                    className="rounded-md p-1.5 text-amber-600 transition-colors hover:bg-amber-50"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                  </button>
                )}
                {reviewActionsFor(r).restore && (
                  <button
                    type="button"
                    title="Restore review"
                    onClick={() => onRestore(r)}
                    className="rounded-md p-1.5 text-kampmax-success transition-colors hover:bg-emerald-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
                <RowMenu label={`review ${r.id}`} actions={menuActions(r)} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </CommunitySectionShell>
  );
}

function MetaCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-kampmax-text-secondary">
        {label}
      </dt>
      <dd className="flex items-center gap-1 truncate text-kampmax-text">{children}</dd>
    </div>
  );
}
