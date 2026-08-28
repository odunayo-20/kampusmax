"use client";

import {
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  FileWarning,
  CircleDashed,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VENDOR_ONBOARDING_STATUS } from "@/types/onboarding";
import type { VendorOnboardingStatus } from "@/types/onboarding";

/**
 * Centralized vendor status badge. Single source of styling for every vendor
 * lifecycle state. NOT colour-only: each state carries an icon + text label so
 * the meaning is clear to colour-blind and screen-reader users.
 */
export function VendorStatusBadge({
  status,
  className,
}: {
  status: VendorOnboardingStatus;
  className?: string;
}) {
  const resolved = resolveBadge(status);
  const Icon = resolved.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        resolved.classes,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span>{resolved.label}</span>
    </span>
  );
}

function resolveBadge(status: VendorOnboardingStatus) {
  switch (status) {
    case VENDOR_ONBOARDING_STATUS.APPROVED:
      return {
        label: "Approved",
        icon: CheckCircle2,
        classes: "bg-success-50 text-success-700 ring-1 ring-success-200",
      };
    case VENDOR_ONBOARDING_STATUS.PENDING_REVIEW:
      return {
        label: "Pending review",
        icon: Clock,
        classes: "bg-warning-50 text-warning-700 ring-1 ring-warning-200",
      };
    case VENDOR_ONBOARDING_STATUS.MORE_INFORMATION_REQUIRED:
      return {
        label: "More info required",
        icon: FileWarning,
        classes: "bg-info-50 text-info-700 ring-1 ring-info-200",
      };
    case VENDOR_ONBOARDING_STATUS.REJECTED:
      return {
        label: "Rejected",
        icon: XCircle,
        classes: "bg-error-50 text-error-700 ring-1 ring-error-200",
      };
    case VENDOR_ONBOARDING_STATUS.SUSPENDED:
      return {
        label: "Suspended",
        icon: Ban,
        classes: "bg-error-50 text-error-700 ring-1 ring-error-200",
      };
    case VENDOR_ONBOARDING_STATUS.IN_PROGRESS:
      return {
        label: "In progress",
        icon: AlertTriangle,
        classes: "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-300",
      };
    case VENDOR_ONBOARDING_STATUS.DRAFT:
    default:
      return {
        label: "Draft",
        icon: CircleDashed,
        classes: "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-300",
      };
  }
}
