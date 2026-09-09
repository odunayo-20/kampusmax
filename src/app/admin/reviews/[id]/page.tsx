"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  ExternalLink,
  FileWarning,
  Flag,
  Handshake,
  Image as ImageIcon,
  MessageSquare,
  ShieldAlert,
  Star,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { StatCard } from "@/components/admin/StatCard";
import { StarRating } from "@/components/admin/reviews/StarRating";
import {
  ReviewSourceBadge,
  ReviewStatusBadge,
  ReviewTargetTypeBadge,
} from "@/components/admin/reviews/ReviewBadges";
import {
  reviewReportReasonLabel,
  reviewStatusSourceLabel,
} from "@/components/admin/reviews/reviews-meta";
import { useAdminReview } from "@/hooks/admin/use-admin-reviews";
import type { ManagedReviewDetail, ManagedReviewReportView } from "@/types/admin";

type DetailTab = "overview" | "reports";

const TABS: { key: DetailTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "reports", label: "Reports & flags" },
];

export default function AdminReviewDetailPage() {
  const params = useParams<{ id: string }>();
  const reviewId = typeof params.id === "string" ? params.id : "";

  const [tab, setTab] = useState<DetailTab>("overview");

  const { data: detail, isPending, isError, refetch } = useAdminReview(reviewId);

  if (!reviewId) {
    return <ReviewNotFound />;
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-72 animate-pulse rounded bg-kampmax-muted" />
        <LoadingSkeleton variant="cards" rows={6} />
        <div className="h-64 animate-pulse rounded-lg bg-white ring-1 ring-kampmax-border" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  if (!detail) {
    return <ReviewNotFound />;
  }

  const { review } = detail;

  return (
    <>
      <Link
        href="/admin/reviews"
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-kampmax-text-secondary transition-colors hover:text-kampmax-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All reviews
      </Link>

      <AdminPageHeader
        title={`Review by ${review.reviewerName}`}
        description={`${review.targetName} · ${review.id} · created ${formatDate(review.createdAt)}`}
        actions={
          <>
            <ReviewStatusBadge status={review.status} />
            <ReviewSourceBadge source={review.statusSource} />
            <ReviewTargetTypeBadge type={review.targetType} />
            {detail.entity.href && (
              <a
                href={detail.entity.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {detail.entity.hrefLabel}
              </a>
            )}
          </>
        }
      />

      {/* ---------- Overview stats ---------- */}
      <section
        aria-label="Review metrics"
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
      >
        <StatCard label="Rating" value={`${review.rating} / 5`} icon={Star} tone="gold" hint="out of 5 stars" />
        <StatCard label="Helpful" value={review.helpfulCount.toLocaleString("en-NG")} icon={ThumbsUp} tone="blue" hint="marked helpful" />
        <StatCard label="Reports" value={String(review.reportedCount)} icon={Flag} tone={review.reportedCount > 0 ? "error" : "default"} hint="read reports" />
        <StatCard label="Verified purchase" value={review.verifiedPurchase ? "Yes" : "No"} icon={BadgeCheck} tone={review.verifiedPurchase ? "success" : "default"} hint={review.verifiedPurchase && review.orderId ? `Order ${review.orderId}` : review.orderId ? `Order ${review.orderId}` : "No order link"} />
        <StatCard label="Signals" value={`${[review.withImages ? "Photo" : null, review.hasResponse ? "Response" : null].filter(Boolean).join(" + ") || "None"}`} icon={MessageSquare} tone="default" hint="images / vendor response" />
      </section>

      {/* ---------- Tabs ---------- */}
      <div
        role="tablist"
        aria-label="Review profile sections"
        className="mt-5 flex gap-1 overflow-x-auto border-b border-kampmax-border no-scrollbar"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
              tab === t.key
                ? "border-kampmax-blue text-kampmax-blue"
                : "border-transparent text-kampmax-text-secondary hover:text-kampmax-text"
            )}
          >
            {t.label}
            {t.key === "reports" && detail.reports.length > 0 && (
              <span className="rounded-full bg-kampmax-muted px-1.5 py-px text-[10px] font-semibold tabular-nums text-kampmax-text-secondary">
                {detail.reports.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4" role="tabpanel">
        {tab === "overview" && <OverviewTab detail={detail} />}
        {tab === "reports" && <ReportsTab detail={detail} />}
      </div>
    </>
  );
}

// ------------------------------------------------------------
// Overview tab
// ------------------------------------------------------------

function OverviewTab({ detail }: { detail: ManagedReviewDetail }) {
  const { review, entity, reviewer } = detail;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Left column */}
      <div className="space-y-4 lg:col-span-2">
        {/* Review information */}
        <section aria-label="Review information" className="rounded-lg border border-kampmax-border bg-white">
          <div className="flex items-center justify-between border-b border-kampmax-border px-4 py-3">
            <h2 className="text-sm font-semibold text-kampmax-text">Review information</h2>
            <span className="font-mono text-xs text-kampmax-text-secondary">{review.id}</span>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 px-4 py-4 sm:grid-cols-2">
            <InfoRow icon={Star} label="Rating" value={`${review.rating} out of 5 stars`} />
            <InfoRow label="Helpful count" value={review.helpfulCount.toLocaleString("en-NG")} />
            <InfoRow label="Status" value={review.status} />
            <InfoRow label="Status source" value={reviewStatusSourceLabel(review.statusSource)} />
            <InfoRow icon={BadgeCheck} label="Verified purchase" value={review.verifiedPurchase ? "Yes" : "No"} />
            <InfoRow label="Order reference" value={review.orderId ?? "—"} mono />
            <InfoRow icon={Clock} label="Created" value={`${formatDate(review.createdAt)} · ${formatDateTime(review.createdAt)}`} />
            <InfoRow label="Last updated" value={review.updatedAt ? formatDate(review.updatedAt) : "—"} />
          </dl>

          <div className="border-t border-kampmax-border px-4 py-3">
            {review.title && (
              <>
                <dt className="text-xs font-medium text-kampmax-text-secondary">Title</dt>
                <dd className="mt-0.5 text-sm font-semibold text-kampmax-text">{review.title}</dd>
              </>
            )}
            <dt className="mt-3 text-xs font-medium text-kampmax-text-secondary">Comment</dt>
            <dd className="mt-1 text-sm leading-relaxed text-kampmax-text">
              {detail.fullComment || "—"}
            </dd>
          </div>
        </section>

        {/* Vendor response */}
        {review.hasResponse && detail.vendorResponse && (
          <section aria-label="Vendor response" className="rounded-lg border border-kampmax-border bg-white">
            <div className="flex items-center gap-1.5 border-b border-kampmax-border px-4 py-3">
              <MessageSquare className="h-3.5 w-3.5 text-kampmax-blue" />
              <h2 className="text-sm font-semibold text-kampmax-text">Vendor response</h2>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm leading-relaxed text-kampmax-text">{detail.vendorResponse.text}</p>
              <p className="mt-2 text-xs text-kampmax-text-secondary">
                {formatDate(detail.vendorResponse.createdAt)}
              </p>
            </div>
          </section>
        )}

        {/* Images */}
        {detail.images.length > 0 && (
          <section aria-label="Review images" className="rounded-lg border border-kampmax-border bg-white">
            <div className="flex items-center gap-1.5 border-b border-kampmax-border px-4 py-3">
              <ImageIcon className="h-3.5 w-3.5 text-kampmax-text-secondary" />
              <h2 className="text-sm font-semibold text-kampmax-text">Review images</h2>
              <span className="ml-auto rounded-full bg-kampmax-muted px-1.5 py-px text-[10px] font-semibold tabular-nums text-kampmax-text-secondary">
                {detail.images.length}
              </span>
            </div>
            <ul className="flex flex-wrap gap-2 px-4 py-3">
              {detail.images.map((img) => (
                <li key={img.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt ?? `Review photo ${img.id}`}
                    className="h-20 w-20 rounded-md border border-kampmax-border object-cover"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Target */}
        <EntityCard detail={detail} />

        {/* Reviewer */}
        <section aria-label="Reviewer" className="rounded-lg border border-kampmax-border bg-white">
          <div className="border-b border-kampmax-border px-4 py-3">
            <h2 className="text-sm font-semibold text-kampmax-text">Reviewer</h2>
          </div>
          <div className="space-y-2.5 px-4 py-3.5">
            <p className="flex items-center gap-2 font-medium text-kampmax-text">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kampmax-muted text-xs font-semibold text-kampmax-text-secondary">
                {initials(reviewer.name)}
              </span>
              {reviewer.name}
              <span className="ml-auto font-mono text-[11px] font-normal text-kampmax-text-secondary">
                {reviewer.id ?? "guest"}
              </span>
            </p>
            {reviewer.campusName && (
              <p className="text-xs text-kampmax-text-secondary">
                {reviewer.campusName} campus
              </p>
            )}
            <p className="text-[11px] leading-relaxed text-kampmax-text-secondary">
              Reviewers who post as campus guests have no user record; their name is
              the one they supplied with the review.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function EntityCard({ detail }: { detail: ManagedReviewDetail }) {
  const { entity } = detail;
  return (
    <section aria-label="Reviewed target" className="rounded-lg border border-kampmax-border bg-white">
      <div className="flex items-center justify-between border-b border-kampmax-border px-4 py-3">
        <h2 className="text-sm font-semibold text-kampmax-text">Reviewed target</h2>
        <ReviewTargetTypeBadge type={entity.targetType} />
      </div>
      <div className="space-y-2.5 px-4 py-3.5">
        <p className="flex items-center gap-1.5 font-medium text-kampmax-text">
          {entity.name}
          {entity.verified && (
            <BadgeCheck aria-label="Verified" className="h-4 w-4 shrink-0 text-kampmax-success" />
          )}
          <span className="ml-auto font-mono text-[11px] font-normal text-kampmax-text-secondary">
            {entity.id}
          </span>
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {entity.href && (
            <a
              href={entity.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {entity.hrefLabel}
            </a>
          )}
          {entity.adminHref && (
            <Link
              href={entity.adminHref}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
            >
              <Handshake className="h-3.5 w-3.5" />
              Open in console
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// Reports & flags tab
// ------------------------------------------------------------

function ReportsTab({ detail }: { detail: ManagedReviewDetail }) {
  if (detail.reports.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-lg border border-kampmax-info/30 bg-kampmax-info/5 px-4 py-3 text-xs leading-relaxed text-kampmax-text-secondary">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-kampmax-info" />
          <p>
            This review console is <span className="font-semibold text-kampmax-text">read-only</span>.
            Neither review store exposes admin moderation transitions (no hide/restore/remove, no
            report triage), so no actions are offered. See{" "}
            <span className="font-mono">MODULE-41-REPORT.md</span> for the backend capabilities
            these controls will ride on.
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-kampmax-border bg-white px-4 py-10 text-center">
          <FileWarning className="mx-auto h-6 w-6 text-kampmax-text-secondary/50" />
          <p className="mt-2 text-sm font-medium text-kampmax-text">No reports on this review</p>
          <p className="mx-auto mt-0.5 max-w-sm text-xs text-kampmax-text-secondary">
            No report was filed against this review in the real store. The reported count is
            never fabricated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-lg border border-kampmax-info/30 bg-kampmax-info/5 px-4 py-3 text-xs leading-relaxed text-kampmax-text-secondary">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-kampmax-info" />
        <p>
          This review console is read-only — the stores expose no report triage, so reports are
          surfaced as read-only evidence only.
        </p>
      </div>

      <section aria-label="Reports and flags" className="rounded-lg border border-kampmax-border bg-white">
        <div className="flex items-center justify-between border-b border-kampmax-border px-4 py-3">
          <h2 className="text-sm font-semibold text-kampmax-text">Reports &amp; flags</h2>
          <span className="inline-flex items-center gap-1 text-xs text-kampmax-text-secondary">
            <Flag className="h-3.5 w-3.5" />
            {detail.reports.length} report{detail.reports.length === 1 ? "" : "s"}
          </span>
        </div>
        <ul className="divide-y divide-kampmax-border/70">
          {detail.reports.map((report) => (
            <ReportRow key={report.id} report={report} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function ReportRow({ report }: { report: ManagedReviewReportView }) {
  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-kampmax-text">
          <UserRound className="h-3.5 w-3.5 text-kampmax-text-secondary" />
          {report.reporterName}
        </p>
        <span className="rounded-full bg-kampmax-muted px-2 py-0.5 text-[11px] font-medium text-kampmax-text-secondary">
          {reviewReportReasonLabel(report.reason)}
        </span>
        <span className="ml-auto font-mono text-[11px] text-kampmax-text-secondary/70">
          {report.id}
        </span>
      </div>
      {report.details && (
        <p className="mt-1.5 text-xs leading-relaxed text-kampmax-text-secondary">
          {report.details}
        </p>
      )}
      <p className="mt-1.5 text-[11px] text-kampmax-text-secondary/70">
        Filed {formatDate(report.createdAt)}
      </p>
    </li>
  );
}

// ------------------------------------------------------------
// Shared pieces
// ------------------------------------------------------------

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon?: typeof Star;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-kampmax-text-secondary">
        <span className="inline-flex items-center gap-1">
          {Icon && <Icon className="h-3 w-3 opacity-60" />}
          {label}
        </span>
      </dt>
      <dd className={cn("mt-0.5 break-all text-sm text-kampmax-text capitalize", mono && "font-mono text-xs normal-case")}>
        {value}
      </dd>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

function ReviewNotFound() {
  return (
    <div className="rounded-lg border border-kampmax-border bg-white p-4">
      <ErrorState
        title="Review not found"
        message="This review may have been removed or the link is incorrect."
      />
      <div className="mt-3 text-center">
        <Link
          href="/admin/reviews"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-kampmax-blue hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to reviews
        </Link>
      </div>
    </div>
  );
}