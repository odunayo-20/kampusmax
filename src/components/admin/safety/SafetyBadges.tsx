"use client";

import { StatusBadge, badgeVariantClasses } from "@/components/admin/StatusBadge";
import type {
  TrustSafetyReportStatus,
  TrustSafetySource,
  TrustSafetyTargetType,
} from "@/types/admin";
import { cn } from "@/lib/utils";
import {
  safetySourceLabel,
  safetySourceVariant,
  safetyStatusLabel,
  safetyStatusVariant,
  safetyTargetTypeLabel,
  safetyTargetTypeVariant,
} from "./safety-meta";

export function SafetyStatusBadge({
  status,
  className,
}: {
  status: TrustSafetyReportStatus;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={safetyStatusVariant(status)}
      label={safetyStatusLabel(status)}
      className={className}
    />
  );
}

export function SafetySourceBadge({
  source,
  className,
}: {
  source: TrustSafetySource;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={safetySourceVariant(source)}
      label={safetySourceLabel(source)}
      dot={false}
      className={className}
    />
  );
}

export function SafetyTargetTypeBadge({
  type,
  className,
}: {
  type: TrustSafetyTargetType;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
        badgeVariantClasses(safetyTargetTypeVariant(type)),
        className
      )}
    >
      {safetyTargetTypeLabel(type)}
    </span>
  );
}