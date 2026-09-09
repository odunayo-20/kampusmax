"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  CalendarClock,
  ClipboardList,
  Clock,
  ExternalLink,
  Eye,
  FileWarning,
  Handshake,
  MapPin,
  ShieldAlert,
  Tag,
  UserRound,
  Wallet,
} from "lucide-react";
import { cn, formatDate, formatDateTime, timeAgo } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { StatCard } from "@/components/admin/StatCard";
import { badgeVariantClasses, type BadgeVariant } from "@/components/admin/StatusBadge";
import { useAdminJob, useAdminJobActivity } from "@/hooks/admin/use-admin-jobs";
import type {
  ManagedJobActivityEvent,
  ManagedJobApplicationStatus,
  ManagedJobDetail,
} from "@/types/admin";
import {
  JobModerationBadge,
  JobPublicationBadge,
  JobStatusBadge,
} from "@/components/admin/jobs/JobBadges";
import {
  budgetTypeLabelOf,
  durationLabelOf,
  experienceLabelOf,
  formatJobBudget,
  JOB_MODERATION_LABELS,
  JOB_PUBLICATION_LABELS,
} from "@/components/admin/jobs/jobs-meta";

type DetailTab = "overview" | "applications" | "contracts" | "moderation" | "activity";

const TABS: { key: DetailTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "applications", label: "Applications" },
  { key: "contracts", label: "Contracts" },
  { key: "moderation", label: "Reports & moderation" },
  { key: "activity", label: "Activity" },
];

const APPLICATION_LABELS: Record<ManagedJobApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const accountStatusVariant: Record<string, BadgeVariant> = {
  active: "success",
  pending_review: "info",
  suspended: "warning",
  rejected: "error",
  external: "neutral",
};

const accountStatusLabel: Record<string, string> = {
  active: "Active",
  pending_review: "Pending review",
  suspended: "Suspended",
  rejected: "Rejected",
  external: "External client",
};

export default function AdminJobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = typeof params.id === "string" ? params.id : "";

  const [tab, setTab] = useState<DetailTab>("overview");

  const { data: detail, isPending, isError, refetch } = useAdminJob(jobId);
  const { data: activity } = useAdminJobActivity(jobId);

  if (!jobId) {
    return <JobNotFound />;
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
    return <JobNotFound />;
  }

  const { listing } = detail;

  return (
    <>
      <Link
        href="/admin/jobs"
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-kampmax-text-secondary transition-colors hover:text-kampmax-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All jobs
      </Link>

      <AdminPageHeader
        title={listing.title}
        description={`${listing.categoryName} · ${listing.workArrangement.replaceAll("_", " ")} · posted ${formatDate(listing.postedAt)}`}
        actions={
          <>
            <JobStatusBadge status={listing.status} />
            <JobPublicationBadge publication={listing.publication} />
            <JobModerationBadge moderation={listing.moderation} />
            <a
              href={`/jobs/${listing.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View public job
            </a>
          </>
        }
      />

      {/* ---------- Overview stats ---------- */}
      <section aria-label="Job metrics" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Budget"
          value={formatJobBudget(listing.budgetMin, listing.budgetMax)}
          icon={Wallet}
          tone="blue"
          hint={budgetTypeLabelOf(listing.budgetType)}
        />
        <StatCard label="Applications" value={String(detail.applications.visible)} icon={UserRound} tone="gold" hint={`${detail.applications.total} total proposals`} />
        <StatCard label="Views" value={listing.viewCount.toLocaleString("en-NG")} icon={Eye} tone="blue" hint="Lifetime" />
        <StatCard label="Deadline" value={formatDate(listing.deadline)} icon={CalendarClock} tone="default" hint={timeAgo(listing.deadline)} />
        <StatCard label="Arrangement" value={listing.workArrangement.replaceAll("_", " ")} icon={Briefcase} tone="default" hint={listing.location.city ?? listing.location.state ?? "Location not stated"} />
        <StatCard label="Employer reports" value={String(listing.employersReported)} icon={FileWarning} tone={listing.employersReported > 0 ? "error" : "default"} hint="No report store" />
      </section>

      {/* ---------- Tabs ---------- */}
      <div
        role="tablist"
        aria-label="Job profile sections"
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
            {t.key === "applications" && detail.applications.visible > 0 && (
              <span className="rounded-full bg-kampmax-muted px-1.5 py-px text-[10px] font-semibold tabular-nums text-kampmax-text-secondary">
                {detail.applications.visible}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4" role="tabpanel">
        {tab === "overview" && (
          <OverviewTab
            detail={detail}
            onOpenEmployer={(id) => router.push(`/admin/employers/${id}`)}
          />
        )}
        {tab === "applications" && <ApplicationsTab applications={detail.applications} />}
        {tab === "contracts" && <ContractsTab detail={detail} />}
        {tab === "moderation" && <ModerationTab detail={detail} />}
        {tab === "activity" && <ActivityTab events={activity ?? detail.activity} />}
      </div>
    </>
  );
}

// ------------------------------------------------------------
// Overview tab
// ------------------------------------------------------------

function OverviewTab({
  detail,
  onOpenEmployer,
}: {
  detail: ManagedJobDetail;
  onOpenEmployer: (employerId: string) => void;
}) {
  const { listing, employer } = detail;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Left column */}
      <div className="space-y-4 lg:col-span-2">
        {/* Job information */}
        <section aria-label="Job information" className="rounded-lg border border-kampmax-border bg-white">
          <div className="flex items-center justify-between border-b border-kampmax-border px-4 py-3">
            <h2 className="text-sm font-semibold text-kampmax-text">Job information</h2>
            <span className="font-mono text-xs text-kampmax-text-secondary">{listing.id}</span>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 px-4 py-4 sm:grid-cols-2">
            <InfoRow icon={Tag} label="Category" value={listing.categoryName} />
            <InfoRow icon={Briefcase} label="Arrangement" value={listing.workArrangement.replaceAll("_", " ")} />
            <InfoRow icon={MapPin} label="Location" value={locationLabel(listing)} />
            <InfoRow label="Experience" value={experienceLabelOf(listing.experienceLevel)} />
            <InfoRow label="Duration" value={durationLabelOf(listing.duration)} />
            <InfoRow label="Budget type" value={budgetTypeLabelOf(listing.budgetType)} />
            <InfoRow label="Posting status" value={listing.status} />
            <InfoRow label="Views" value={listing.viewCount.toLocaleString("en-NG")} />
            <InfoRow label="Posted" value={`${timeAgo(listing.postedAt)} · ${formatDate(listing.postedAt)}`} />
            <InfoRow label="Deadline" value={`${timeAgo(listing.deadline)} · ${formatDate(listing.deadline)}`} />
          </dl>

          <div className="border-t border-kampmax-border px-4 py-3">
            <dt className="text-xs font-medium text-kampmax-text-secondary">Summary</dt>
            <dd className="mt-1 text-sm leading-relaxed text-kampmax-text">{listing.summary || "—"}</dd>

            <dt className="mt-3 text-xs font-medium text-kampmax-text-secondary">Description</dt>
            <dd className="mt-1 text-sm leading-relaxed text-kampmax-text">{listing.description || "—"}</dd>

            <dt className="mt-3 text-xs font-medium text-kampmax-text-secondary">Requirements</dt>
            <dd className="mt-1 text-sm leading-relaxed text-kampmax-text">{listing.requirements || "—"}</dd>

            {listing.skills.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {listing.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full bg-kampmax-muted px-2 py-0.5 text-[11px] font-medium text-kampmax-text-secondary"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Moderation state */}
        <section aria-label="Moderation state" className="rounded-lg border border-kampmax-border bg-white">
          <div className="flex items-center justify-between border-b border-kampmax-border px-4 py-3">
            <h2 className="text-sm font-semibold text-kampmax-text">Moderation state</h2>
            <JobModerationBadge moderation={listing.moderation} />
          </div>
          <div className="space-y-3 px-4 py-3">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <InfoRow label="Status" value={listing.status} />
              <InfoRow label="Publication" value={JOB_PUBLICATION_LABELS[listing.publication]} />
              <InfoRow label="Moderation" value={JOB_MODERATION_LABELS[listing.moderation]} />
            </dl>
            <p className="text-[11px] leading-relaxed text-kampmax-text-secondary">
              Publication and moderation are derived from the single real status field. The
              platform has no job-approval moderation pipeline, so <span className="font-medium text-kampmax-text">“pending_review”</span>{" "}
              is the only moderation-like state in the dataset — nothing else is invented.
            </p>
          </div>
        </section>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Employer */}
        <EmployerCard employer={employer} onOpen={onOpenEmployer} />

        {/* Budget */}
        <section aria-label="Budget" className="rounded-lg border border-kampmax-border bg-white">
          <div className="border-b border-kampmax-border px-4 py-3">
            <h2 className="text-sm font-semibold text-kampmax-text">Budget</h2>
          </div>
          <dl className="divide-y divide-kampmax-border/70 px-4 py-1">
            <MoneyRow label="Range" value={formatJobBudget(listing.budgetMin, listing.budgetMax)} strong />
            <MoneyRow label="Type" value={budgetTypeLabelOf(listing.budgetType)} />
          </dl>
          <p className="border-t border-kampmax-border px-4 py-2 text-[11px] text-kampmax-text-secondary">
            Where a range was not stated, it reads as “Not stated” — never estimated.
          </p>
        </section>

        {/* Engagement */}
        <section aria-label="Engagement" className="rounded-lg border border-kampmax-border bg-white">
          <div className="border-b border-kampmax-border px-4 py-3">
            <h2 className="text-sm font-semibold text-kampmax-text">Engagement</h2>
          </div>
          <dl className="divide-y divide-kampmax-border/70 px-4 py-1">
            <MoneyRow label="Views" value={listing.viewCount.toLocaleString("en-NG")} />
            <MoneyRow label="Applications" value={String(detail.applications.visible)} />
            <MoneyRow label="Last activity" value={detail.applications.latestAt ? timeAgo(detail.applications.latestAt) : timeAgo(listing.postedAt)} />
          </dl>
        </section>
      </div>
    </div>
  );
}

function locationLabel(listing: ManagedJobDetail["listing"]): string {
  const parts = [listing.location.city, listing.location.state, listing.location.campusName].filter(
    (p): p is string => Boolean(p)
  );
  if (listing.location.remote) parts.push("Remote");
  return parts.length > 0 ? parts.join(", ") : "Not stated";
}

function EmployerCard({
  employer,
  onOpen,
}: {
  employer: ManagedJobDetail["employer"];
  onOpen: (employerId: string) => void;
}) {
  return (
    <section aria-label="Employer" className="rounded-lg border border-kampmax-border bg-white">
      <div className="flex items-center justify-between border-b border-kampmax-border px-4 py-3">
        <h2 className="text-sm font-semibold text-kampmax-text">Employer</h2>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            badgeVariantClasses(accountStatusVariant[employer.accountStatus] ?? "neutral")
          )}
        >
          {accountStatusLabel[employer.accountStatus] ?? employer.accountStatus}
        </span>
      </div>
      <div className="space-y-2.5 px-4 py-3.5">
        <p className="flex items-center gap-1.5 font-medium text-kampmax-text">
          {employer.name}
          {employer.verified && (
            <BadgeCheck aria-label="Verified employer" className="h-4 w-4 shrink-0 text-kampmax-success" />
          )}
          <span className="ml-auto font-mono text-[11px] font-normal text-kampmax-text-secondary">
            {employer.id}
          </span>
        </p>
        {employer.organizationName && (
          <p className="text-xs text-kampmax-text-secondary">{employer.organizationName}</p>
        )}
        <p className="text-xs leading-relaxed text-kampmax-text-secondary">“{employer.descriptor}”</p>

        <dl className="grid grid-cols-1 gap-x-5 gap-y-2 border-t border-kampmax-border/70 pt-2.5 text-xs">
          <InfoRow label="Campus" value={employer.campusName ?? "—"} />
          <InfoRow label="Location" value={employer.location ?? "—"} />
          <InfoRow label="Job posts on platform" value={String(employer.jobsTotal)} />
          <InfoRow label="Slug" value={employer.slug ? `/e/${employer.slug}` : "—"} mono />
        </dl>

        <button
          type="button"
          onClick={() => onOpen(employer.id)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
        >
          <Handshake className="h-3.5 w-3.5" />
          Open employer profile
        </button>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// Applications tab
// ------------------------------------------------------------

function ApplicationsTab({
  applications,
}: {
  applications: ManagedJobDetail["applications"];
}) {
  const statusKeyOrder: ManagedJobApplicationStatus[] = [
    "under_review",
    "shortlisted",
    "accepted",
    "submitted",
    "rejected",
    "withdrawn",
  ];

  return (
    <div className="space-y-4">
      <section aria-label="Application summary" className="rounded-lg border border-kampmax-border bg-white">
        <div className="border-b border-kampmax-border px-4 py-3">
          <h2 className="text-sm font-semibold text-kampmax-text">Application summary</h2>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-4 py-4 sm:grid-cols-4">
          <MoneyRow label="Total proposals" value={String(applications.total)} strong />
          <MoneyRow label="Visible" value={String(applications.visible)} />
          <MoneyRow label="Accepted" value={String(applications.byStatus.accepted)} />
          <MoneyRow label="Latest activity" value={applications.latestAt ? timeAgo(applications.latestAt) : "—"} />
        </dl>

        <div className="border-t border-kampmax-border px-4 py-4">
          <p className="text-xs font-medium text-kampmax-text-secondary">Breakdown by status</p>
          <ul className="mt-2 space-y-1.5">
            {statusKeyOrder.map((key) => {
              const count = applications.byStatus[key] ?? 0;
              const max = Math.max(applications.total, 1);
              return (
                <li key={key} className="flex items-center gap-3 text-xs">
                  <span className="w-28 shrink-0 text-kampmax-text-secondary">
                    {APPLICATION_LABELS[key]}
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-kampmax-muted">
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        barClass(key)
                      )}
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </span>
                  <span className="w-6 shrink-0 text-right tabular-nums text-kampmax-text">{count}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="border-t border-kampmax-border px-4 py-3 text-[11px] leading-relaxed text-kampmax-text-secondary">
          Proposals ARE the applications — this store keeps one hiring entity, never a duplicate
          model. Individual application records (freelancer, cover letter, proposed amount) are
          surfaced in the freelancer hiring pipeline; a per-job application DTO is a backend gap
          this console does not fabricate.
        </p>
      </section>
    </div>
  );
}

function barClass(status: ManagedJobApplicationStatus): string {
  switch (status) {
    case "accepted":
      return "bg-kampmax-success";
    case "shortlisted":
      return "bg-kampmax-gold";
    case "under_review":
      return "bg-kampmax-info";
    case "submitted":
      return "bg-kampmax-blue";
    case "rejected":
      return "bg-kampmax-error/60";
    case "withdrawn":
      return "bg-kampmax-text-secondary/40";
  }
}

// ------------------------------------------------------------
// Contracts tab
// ------------------------------------------------------------

function ContractsTab({ detail }: { detail: ManagedJobDetail }) {
  return (
    <div className="space-y-4">
      <section aria-label="Contracts" className="rounded-lg border border-kampmax-border bg-white">
        <div className="flex items-center justify-between border-b border-kampmax-border px-4 py-3">
          <h2 className="text-sm font-semibold text-kampmax-text">Contracts</h2>
          <span className="inline-flex items-center gap-1 text-xs text-kampmax-text-secondary">
            <Handshake className="h-3.5 w-3.5" />
            {detail.contracts.count} linked
          </span>
        </div>
        <div className="px-4 py-6 text-center">
          <Handshake className="mx-auto h-6 w-6 text-kampmax-text-secondary/50" />
          <p className="mt-2 text-sm font-medium text-kampmax-text">
            No contracts linked to this job&apos;s proposals.
          </p>
          <p className="mx-auto mt-0.5 max-w-md text-xs text-kampmax-text-secondary">
            {detail.contracts.note}
          </p>
        </div>
      </section>
    </div>
  );
}

// ------------------------------------------------------------
// Reports & moderation tab
// ------------------------------------------------------------

function ModerationTab({ detail }: { detail: ManagedJobDetail }) {
  const { listing } = detail;
  return (
    <div className="space-y-4">
      {/* Read-only notice */}
      <div className="flex items-start gap-2.5 rounded-lg border border-kampmax-info/30 bg-kampmax-info/5 px-4 py-3 text-xs leading-relaxed text-kampmax-text-secondary">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-kampmax-info" />
        <p>
          This job console is <span className="font-semibold text-kampmax-text">read-only</span>.
          The prototype store has no admin moderation transitions (no publish/approve/reject,
          no feature), so no actions are offered. See{" "}
          <span className="font-mono">MODULE-40-REPORT.md</span> for the API capabilities these
          controls will ride on.
        </p>
      </div>

      {/* Moderation state */}
      <section aria-label="Moderation state" className="rounded-lg border border-kampmax-border bg-white">
        <div className="border-b border-kampmax-border px-4 py-3">
          <h2 className="text-sm font-semibold text-kampmax-text">Moderation state</h2>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-kampmax-text">
              {JOB_MODERATION_LABELS[listing.moderation]}
            </p>
            <p className="mt-0.5 text-xs text-kampmax-text-secondary">
              {listing.moderation === "pending_review"
                ? "This job was submitted for review and awaits a moderation decision that the current store does not provide."
                : "No platform moderation flags are recorded against this job in the real dataset."}
            </p>
          </div>
          <JobModerationBadge moderation={listing.moderation} />
        </div>
      </section>

      {/* Reports */}
      <section aria-label="Reports and flags" className="rounded-lg border border-kampmax-border bg-white">
        <div className="flex items-center justify-between border-b border-kampmax-border px-4 py-3">
          <h2 className="text-sm font-semibold text-kampmax-text">Reports &amp; flags</h2>
          <span className="inline-flex items-center gap-1 text-xs text-kampmax-text-secondary">
            <FileWarning className="h-3.5 w-3.5" />
            Employer reports
          </span>
        </div>
        <div className="px-4 py-6 text-center">
          <FileWarning className="mx-auto h-6 w-6 text-kampmax-text-secondary/50" />
          <p className="mt-2 text-sm font-medium text-kampmax-text">
            {listing.employersReported === 0
              ? "No reports available."
              : `${listing.employersReported} reports`}
          </p>
          <p className="mx-auto mt-0.5 max-w-sm text-xs text-kampmax-text-secondary">
            Employers have not reported this job. Report triage will surface here once the
            reporting API lands; the count is never fabricated.
          </p>
        </div>
      </section>
    </div>
  );
}

// ------------------------------------------------------------
// Activity tab
// ------------------------------------------------------------

function ActivityTab({ events }: { events: ManagedJobActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-kampmax-border bg-white px-4 py-10 text-center">
        <Clock className="mx-auto h-6 w-6 text-kampmax-text-secondary/50" />
        <p className="mt-2 text-sm font-medium text-kampmax-text">No activity recorded</p>
      </div>
    );
  }

  return (
    <section aria-label="Job activity" className="rounded-lg border border-kampmax-border bg-white px-4 py-4">
      <ol className="relative space-y-4 before:absolute before:bottom-1.5 before:left-[13px] before:top-1.5 before:w-px before:bg-kampmax-border">
        {events.map((event) => {
          const Icon = kindIcon(event.kind);
          return (
            <li key={event.id} className="relative flex gap-3 pl-0">
              <span
                aria-hidden
                className={cn(
                  "z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ring-white",
                  kindClasses(event.kind)
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[13px] font-medium leading-snug text-kampmax-text">{event.message}</p>
                <p className="mt-0.5 text-xs text-kampmax-text-secondary">
                  <span title={formatDateTime(event.at)}>{timeAgo(event.at)}</span>
                  {" · "}
                  {event.meta}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function kindIcon(kind: ManagedJobActivityEvent["kind"]) {
  switch (kind) {
    case "application":
      return UserRound;
    case "hiring":
      return Handshake;
    case "deadline":
      return Clock;
    case "job":
    default:
      return ClipboardList;
  }
}

function kindClasses(kind: ManagedJobActivityEvent["kind"]): string {
  switch (kind) {
    case "application":
      return "bg-kampmax-blue/10 text-kampmax-blue";
    case "hiring":
      return "bg-kampmax-success/10 text-kampmax-success";
    case "deadline":
      return "bg-kampmax-warning/10 text-amber-700";
    case "job":
    default:
      return "bg-kampmax-info/10 text-kampmax-info";
  }
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
  icon?: typeof Tag;
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

function MoneyRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <dt className="text-kampmax-text-secondary">{label}</dt>
      <dd className={cn("tabular-nums", strong ? "font-semibold text-kampmax-text" : "font-medium text-kampmax-text")}>
        {value}
      </dd>
    </div>
  );
}

function JobNotFound() {
  return (
    <div className="rounded-lg border border-kampmax-border bg-white p-4">
      <ErrorState
        title="Job not found"
        message="This job may have been removed or the link is incorrect."
      />
      <div className="mt-3 text-center">
        <Link
          href="/admin/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-kampmax-blue hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to jobs
        </Link>
      </div>
    </div>
  );
}