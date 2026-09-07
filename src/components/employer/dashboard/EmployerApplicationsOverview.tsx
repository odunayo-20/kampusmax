"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui";
import { ProposalStatusBadge } from "@/components/freelancer/opportunities/StatusBadges";
import { formatNaira, timeAgo } from "@/lib/utils";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { EMPLOYER_APPLICATION_STATUSES } from "@/types/opportunity";
import {
  EmployerDashboardEmpty,
  EmployerDashboardError,
  EmployerDashboardSection,
  EmployerDashboardSkeleton,
} from "./EmployerDashboardSection";
import type { EmployerDashboardQuerySource } from "./EmployerDashboardSection";

export function EmployerApplicationsOverview({
  query,
}: {
  query: EmployerDashboardQuerySource;
}) {
  const counts = query.data?.appCounts;
  const applications = query.data?.recentApplications ?? [];

  if (query.isPending && !query.data) {
    return (
      <EmployerDashboardSection title="Applications" action={{ href: "/employer/applications", label: "All applications" }}>
        <EmployerDashboardSkeleton rows={4} />
      </EmployerDashboardSection>
    );
  }

  if (query.isError && !query.data) {
    return (
      <EmployerDashboardSection title="Applications" action={{ href: "/employer/applications", label: "All applications" }}>
        <EmployerDashboardError message={getFriendlyErrorMessage(query.error)} onRetry={query.refetch} />
      </EmployerDashboardSection>
    );
  }

  return (
    <EmployerDashboardSection title="Applications" action={{ href: "/employer/applications", label: "All applications" }}>
      <div className="mb-4 flex flex-wrap gap-2">
        {EMPLOYER_APPLICATION_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/employer/applications?status=${status}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-kampmax-border bg-kampmax-bg px-2.5 py-1 text-xs font-medium text-kampmax-text hover:border-primary-300 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <span className="capitalize">{status.replace(/_/g, " ")}</span>
            <span className="font-bold text-kampmax-text-secondary">{counts?.[status] ?? 0}</span>
          </Link>
        ))}
      </div>

      {applications.length === 0 ? (
        <EmployerDashboardEmpty
          title="No applications yet"
          detail="Applications from candidates will appear here."
        />
      ) : (
        <ul className="divide-y divide-kampmax-border/70">
          {applications.map((application) => (
            <li key={application.proposal.id}>
              <Link
                href={`/employer/applications/${application.proposal.id}`}
                className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
              >
                <Avatar name={application.candidate.name} src={application.candidate.avatar} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-kampmax-text">
                    {application.candidate.name}
                  </span>
                  <span className="block truncate text-xs text-kampmax-text-secondary">
                    {application.job.title} ·{" "}
                    {application.proposal.proposedAmount
                      ? formatNaira(application.proposal.proposedAmount)
                      : "Open budget"}{" "}
                    · {timeAgo(application.proposal.updatedAt)}
                  </span>
                </span>
                <ProposalStatusBadge status={application.proposal.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </EmployerDashboardSection>
  );
}