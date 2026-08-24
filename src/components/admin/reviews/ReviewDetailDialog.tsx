"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCheck,
  EyeOff,
  Loader2,
  SearchCheck,
  Store,
  Tag,
  X,
} from "lucide-react";
import { StatusBadge, priorityVariant } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { communityCampusName } from "@/components/admin/campus-community/campus-community-utils";
import {
  REVIEW_REPORT_REASON_LABELS,
  REVIEW_REPORT_STATUS_LABELS,
  reviewReportStatusVariant,
} from "./reviews-meta";
import { StarRating } from "./StarRating";
import { reviewManagementService } from "@/services/admin";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";
import type {
  ManagedReviewDetail,
  ReviewReport,
  ReviewReportStatus,
} from "@/types/admin";

interface ReviewDetailDialogProps {
  /** When true, the reports section is expanded on open ("investigate"). */
  reviewId: string | null;
  focusReports?: boolean;
  onClose: () => void;
  onToast: (tone: "success" | "error", text: string) => void;
  /** Notify the table that moderation state may have changed. */
  onMutated: () => void;
}

/**
 * Full review inspector: rating, verified-purchase evidence and an
 * inline report triage queue for the "investigate" flow.
 */
export function ReviewDetailDialog({
  reviewId,
  focusReports = false,
  onClose,
  onToast,
  onMutated,
}: ReviewDetailDialogProps) {
  const [detail, setDetail] = useState<ManagedReviewDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!reviewId) return;
    setLoading(true);
    setError(false);
    try {
      const d = await reviewManagementService.getById(reviewId);
      setDetail(d);
      if (!d) setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    if (reviewId) void load();
    else setDetail(null);
  }, [reviewId, load]);

  useEffect(() => {
    if (!reviewId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [reviewId, onClose]);

  async function triage(report: ReviewReport, status: Exclude<ReviewReportStatus, "open">) {
    setWorkingId(report.id);
    try {
      await reviewManagementService.setReportStatus(report.id, status);
      onToast(
        "success",
        `Report ${report.id.toUpperCase()} ${
          status === "actioned"
            ? "closed as actioned"
            : status === "dismissed"
              ? "dismissed"
              : "moved to review"
        }.`
      );
      await load();
      onMutated();
    } catch (err) {
      onToast(
        "error",
        err instanceof Error ? err.message : "Couldn't update the report."
      );
    } finally {
      setWorkingId(null);
    }
  }

  if (!reviewId) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Review details"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-kampmax-border bg-white shadow-xl">
        {loading && !detail ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-kampmax-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading review…
          </div>
        ) : error || !detail ? (
          <div className="px-5 py-14 text-center text-sm text-kampmax-text-secondary">
            Couldn&apos;t load this review.
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-kampmax-border px-5 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] uppercase text-kampmax-text-secondary">
                    {detail.review.id}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-kampmax-text">
                  {detail.review.reviewer.name}
                </p>
                <p className="text-xs capitalize text-kampmax-text-secondary">
                  {formatDateTime(detail.review.createdAt)} ·{" "}
                  {communityCampusName(detail.review.campusId)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="-mr-1 rounded-md p-1 text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted hover:text-kampmax-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div
              className={cn(
                "flex-1 space-y-5 overflow-y-auto px-5 py-4",
                focusReports && "flex flex-col"
              )}
            >
              {/* Rating + verification */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <StarRating rating={detail.review.rating} size="md" />
                {detail.review.verifiedPurchase ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-kampmax-success/10 px-2 py-0.5 text-xs font-medium text-kampmax-success">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                    Verified purchase · Order {detail.review.orderRef}
                  </span>
                ) : (
                  <span className="rounded-full bg-kampmax-muted px-2 py-0.5 text-xs font-medium text-kampmax-text-secondary">
                    Unverified purchase
                  </span>
                )}
                <span className="ml-auto text-xs tabular-nums text-kampmax-text-secondary">
                  {detail.review.helpfulCount} found this helpful
                </span>
              </div>

              {/* Review content */}
              <div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-kampmax-text">
                  {detail.review.comment}
                </p>
              </div>

              {/* Target context */}
              <dl className="grid grid-cols-1 gap-2 rounded-lg border border-kampmax-border bg-kampmax-muted/30 px-3 py-2.5 text-xs sm:grid-cols-2">
                <div className="flex min-w-0 items-center gap-2">
                  {detail.review.targetType === "product" ? (
                    <Tag className="h-3.5 w-3.5 shrink-0 text-kampmax-text-secondary" aria-hidden />
                  ) : (
                    <Store className="h-3.5 w-3.5 shrink-0 text-kampmax-text-secondary" aria-hidden />
                  )}
                  <div className="min-w-0">
                    <dt className="text-[10px] uppercase tracking-wide text-kampmax-text-secondary">
                      Reviewed {detail.review.targetType}
                    </dt>
                    <dd className="truncate font-medium text-kampmax-text">
                      {detail.review.targetTitle}
                    </dd>
                  </div>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <Store className="h-3.5 w-3.5 shrink-0 text-kampmax-text-secondary" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-[10px] uppercase tracking-wide text-kampmax-text-secondary">
                      Vendor
                    </dt>
                    <dd className="truncate font-medium text-kampmax-text">
                      {detail.review.vendorName}
                    </dd>
                  </div>
                </div>
              </dl>

              {/* Reports / investigation queue */}
              <section aria-label="Reports against this review" className={cn(focusReports && "flex-1")}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">
                  Reports ({detail.reports.length})
                </h3>
                {detail.reports.length === 0 ? (
                  <EmptyState
                    compact
                    icon={SearchCheck}
                    title="No reports against this review"
                    message="Students haven't flagged this feedback."
                    className="mt-2"
                  />
                ) : (
                  <ul className="mt-2 space-y-2">
                    {detail.reports.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-lg border border-kampmax-border px-3 py-2.5"
                      >
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <SearchCheck className="h-3.5 w-3.5 shrink-0 text-kampmax-warning" aria-hidden />
                          <span className="text-xs font-semibold text-kampmax-text">
                            {REVIEW_REPORT_REASON_LABELS[r.reason]}
                          </span>
                          <StatusBadge variant={priorityVariant(r.priority)} label={r.priority} />
                          <StatusBadge
                            variant={reviewReportStatusVariant(r.status)}
                            label={REVIEW_REPORT_STATUS_LABELS[r.status]}
                          />
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-kampmax-text-secondary">
                          &ldquo;{r.detail}&rdquo;
                        </p>
                        <p className="mt-1 text-[11px] text-kampmax-text-secondary">
                          Reported by {r.reporterName} · {timeAgo(r.createdAt)}
                        </p>
                        {r.status !== "actioned" && r.status !== "dismissed" && (
                          <div className="mt-2 flex gap-2">
                            <TriageButton
                              icon={EyeOff}
                              label="Dismiss"
                              loading={workingId === r.id}
                              disabled={workingId !== null}
                              onClick={() => void triage(r, "dismissed")}
                            />
                            <TriageButton
                              primary
                              icon={CheckCheck}
                              label="Actioned"
                              loading={workingId === r.id}
                              disabled={workingId !== null}
                              onClick={() => void triage(r, "actioned")}
                            />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="border-t border-kampmax-border px-5 py-3 pb-3.5 text-right">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 items-center rounded-md bg-kampmax-navy px-3 text-xs font-medium text-white transition-colors hover:bg-kampmax-navy-light"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TriageButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  loading,
  primary,
}: {
  icon: typeof SearchCheck;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-[11px] font-medium transition-colors disabled:opacity-50",
        primary
          ? "bg-kampmax-navy text-white hover:bg-kampmax-navy-light"
          : "border border-kampmax-border bg-white text-kampmax-text hover:bg-kampmax-muted/60"
      )}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Icon className="h-3 w-3" />
      )}
      {label}
    </button>
  );
}
