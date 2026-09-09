"use client";

import { StatusBadge, badgeVariantClasses } from "@/components/admin/StatusBadge";
import type {
  ManagedJobModeration,
  ManagedJobPublication,
  ManagedJobStatus,
} from "@/types/admin";
import { cn } from "@/lib/utils";
import type { OpportunityWorkArrangement } from "@/types/opportunity";
import {
  ARRANGEMENT_LABELS,
  arrangementVariant,
  jobModerationVariant,
  jobPublicationVariant,
  jobStatusVariant,
} from "./jobs-meta";

export function JobStatusBadge({
  status,
  className,
}: {
  status: ManagedJobStatus;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={jobStatusVariant(status)}
      label={status}
      className={className}
    />
  );
}

export function JobPublicationBadge({
  publication,
  className,
}: {
  publication: ManagedJobPublication;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={jobPublicationVariant(publication)}
      label={publication}
      className={className}
    />
  );
}

export function JobModerationBadge({
  moderation,
  className,
}: {
  moderation: ManagedJobModeration;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={jobModerationVariant(moderation)}
      label={moderation.replaceAll("_", " ")}
      dot={false}
      className={className}
    />
  );
}

export function ArrangementBadge({
  arrangement,
  className,
}: {
  arrangement: OpportunityWorkArrangement | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        badgeVariantClasses(arrangementVariant(arrangement)),
        className
      )}
    >
      {ARRANGEMENT_LABELS[arrangement] ?? arrangement}
    </span>
  );
}