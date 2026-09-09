"use client";

import { StatusBadge, badgeVariantClasses } from "@/components/admin/StatusBadge";
import type {
  ManagedReviewStatus,
  ManagedReviewStatusSource,
  ManagedReviewTargetType,
} from "@/types/admin";
import { cn } from "@/lib/utils";
import {
  reviewStatusLabel,
  reviewStatusSourceLabel,
  reviewStatusSourceVariant,
  reviewStatusVariant,
  reviewTargetTypeLabel,
  reviewTargetTypeVariant,
} from "./reviews-meta";

export function ReviewStatusBadge({
  status,
  className,
}: {
  status: ManagedReviewStatus;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={reviewStatusVariant(status)}
      label={reviewStatusLabel(status)}
      className={className}
    />
  );
}

/** Notes where the status value actually came from ("Backend status" vs "Derived"). */
export function ReviewSourceBadge({
  source,
  className,
}: {
  source: ManagedReviewStatusSource;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={reviewStatusSourceVariant(source)}
      label={reviewStatusSourceLabel(source)}
      dot={false}
      className={className}
    />
  );
}

export function ReviewTargetTypeBadge({
  type,
  className,
}: {
  type: ManagedReviewTargetType;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
        badgeVariantClasses(reviewTargetTypeVariant(type)),
        className
      )}
    >
      {reviewTargetTypeLabel(type)}
    </span>
  );
}