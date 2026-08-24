"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCheck,
  EyeOff,
  Flag,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  communityCampusName,
  previewText,
} from "./campus-community-utils";
import {
  COMMENT_STATUS_LABELS,
  commentStatusVariant,
  REPORT_REASON_LABELS,
  REPORT_TARGET_TYPE_LABELS,
  communityPostStatusLabel,
  communityPostStatusVariant,
  reportStatusVariant,
} from "./campus-community-meta";
import { EngagementStats } from "./shared";
import { communityService } from "@/services/admin";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";
import type {
  CommunityAuthor,
  CommunityPostDetail,
  CommunityReport,
  CommunityReportStatus,
} from "@/types/admin";

interface PostDetailDialogProps {
  postId: string | null;
  onClose: () => void;
  onViewAuthor: (author: CommunityAuthor) => void;
  onToast: (tone: "success" | "error", text: string) => void;
  /** Notify the table that moderation state may have changed. */
  onMutated: () => void;
}

/**
 * Full post inspector: content, engagement, its comments and every
 * abuse report against it (or its comments) with inline triage.
 */
export function PostDetailDialog({
  postId,
  onClose,
  onViewAuthor,
  onToast,
  onMutated,
}: PostDetailDialogProps) {
  const [detail, setDetail] = useState<CommunityPostDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [workingReportId, setWorkingReportId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(false);
    try {
      const d = await communityService.getPostDetail(postId);
      setDetail(d);
      if (!d) setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) void load();
    else setDetail(null);
  }, [postId, load]);

  useEffect(() => {
    if (!postId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [postId, onClose]);

  async function triage(
    report: CommunityReport,
    status: Exclude<CommunityReportStatus, "open">
  ) {
    setWorkingReportId(report.id);
    try {
      await communityService.setReportStatus(report.id, status);
      onToast(
        "success",
        `Report ${report.id.toUpperCase()} marked ${
          status === "actioned" ? "actioned" : status
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
      setWorkingReportId(null);
    }
  }

  if (!postId) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Post details"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-kampmax-border bg-white shadow-xl">
        {loading && !detail ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-kampmax-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading post…
          </div>
        ) : error || !detail ? (
          <div className="px-5 py-14 text-center text-sm text-kampmax-text-secondary">
            Couldn&apos;t load this post.
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-kampmax-border px-5 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] uppercase text-kampmax-text-secondary">
                    {detail.post.id}
                  </span>
                  <StatusBadge
                    variant={communityPostStatusVariant(detail.post.status)}
                    label={communityPostStatusLabel(detail.post.status)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onViewAuthor(detail.post.author)}
                  className="mt-1.5 text-sm font-medium text-kampmax-blue hover:underline"
                >
                  {detail.post.author.name}
                </button>
                <p className="text-xs capitalize text-kampmax-text-secondary">
                  {detail.post.type.replace(/_/g, " ")} ·{" "}
                  {communityCampusName(detail.post.campusId)} ·{" "}
                  {formatDateTime(detail.post.createdAt)}
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
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              <div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-kampmax-text">
                  {detail.post.content}
                </p>
                <div className="mt-3">
                  <EngagementStats
                    likes={detail.post.likeCount}
                    comments={detail.post.commentCount}
                    shares={detail.post.shareCount}
                  />
                </div>
              </div>

              {/* Comments on this post */}
              <section aria-label="Comments on this post">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">
                  Comments ({detail.comments.length})
                </h3>
                {detail.comments.length === 0 ? (
                  <p className="mt-2 text-xs text-kampmax-text-secondary">
                    No comments captured for this post yet.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {detail.comments.map((c) => (
                      <li
                        key={c.id}
                        className="rounded-lg border border-kampmax-border px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-medium text-kampmax-text">
                            {c.author.name}
                            <span className="ml-2 font-normal tabular-nums text-kampmax-text-secondary">
                              {timeAgo(c.createdAt)}
                            </span>
                          </span>
                          <StatusBadge
                            variant={commentStatusVariant(c.status)}
                            label={COMMENT_STATUS_LABELS[c.status]}
                          />
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-kampmax-text-secondary">
                          {c.content}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Reports */}
              <section aria-label="Reports against this post">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">
                  Reports ({detail.reports.length})
                </h3>
                {detail.reports.length === 0 ? (
                  <EmptyState
                    compact
                    icon={Search}
                    title="No open reports"
                    message="Students haven't reported this post or any of its comments."
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
                          <Flag className="h-3.5 w-3.5 shrink-0 text-kampmax-error" aria-hidden />
                          <span className="text-xs font-semibold text-kampmax-text">
                            {REPORT_REASON_LABELS[r.reason]}
                          </span>
                          <span className="rounded bg-kampmax-muted px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-kampmax-text-secondary">
                            {REPORT_TARGET_TYPE_LABELS[r.targetType]}
                          </span>
                          <StatusBadge
                            variant={reportStatusVariant(r.status)}
                            label={r.status}
                          />
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-kampmax-text-secondary">
                          &ldquo;{r.detail}&rdquo;
                        </p>
                        <p className="mt-1 text-[11px] text-kampmax-text-secondary">
                          Reported by {r.reporterName} · {timeAgo(r.createdAt)}
                          {r.targetType !== "post" &&
                            ` · target ${previewText(r.targetPreview, 48)}`}
                        </p>
                        {r.status !== "actioned" && r.status !== "dismissed" && (
                          <div className="mt-2 flex gap-2">
                            <TriageButton
                              loading={workingReportId === r.id}
                              icon={EyeOff}
                              label="Dismiss"
                              disabled={workingReportId !== null}
                              onClick={() => void triage(r, "dismissed")}
                            />
                            <TriageButton
                              primary
                              loading={workingReportId === r.id}
                              icon={CheckCheck}
                              label="Actioned"
                              disabled={workingReportId !== null}
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
  icon: typeof Flag;
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
