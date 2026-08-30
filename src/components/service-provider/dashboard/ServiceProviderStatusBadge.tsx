"use client";

import { CheckCircle2, Clock, Ban, XCircle, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceProviderOnboardingStatus } from "@/types/service-provider";
import type { ServiceProviderVerificationStatus } from "@/types/service-provider";

const SP_STATUS_CONFIG: Record<
  ServiceProviderOnboardingStatus,
  { label: string; tone: string; icon: typeof CheckCircle2 }
> = {
  DRAFT: { label: "Draft", tone: "bg-neutral-100 text-neutral-700 ring-neutral-200", icon: FileQuestion },
  IN_PROGRESS: { label: "In Progress", tone: "bg-info-50 text-info-700 ring-info-200", icon: Clock },
  PENDING_REVIEW: { label: "Under Review", tone: "bg-warning-50 text-warning-700 ring-warning-200", icon: Clock },
  MORE_INFORMATION_REQUIRED: { label: "More Info Needed", tone: "bg-warning-50 text-warning-700 ring-warning-200", icon: FileQuestion },
  APPROVED: { label: "Approved", tone: "bg-success-50 text-success-700 ring-success-200", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", tone: "bg-error-50 text-error-700 ring-error-200", icon: XCircle },
  SUSPENDED: { label: "Suspended", tone: "bg-error-50 text-error-700 ring-error-200", icon: Ban },
};

/**
 * Screen-reader-friendly status indicator. Profile state is never communicated
 * through color alone — each badge carries text + icon.
 */
export function ServiceProviderStatusBadge({
  status,
  className,
}: {
  status: ServiceProviderOnboardingStatus;
  className?: string;
}) {
  const config = SP_STATUS_CONFIG[status] ?? SP_STATUS_CONFIG.DRAFT;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        config.tone,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {config.label}
    </span>
  );
}

const VERIFICATION_CONFIG: Record<
  ServiceProviderVerificationStatus,
  { label: string; tone: string; icon: typeof CheckCircle2 }
> = {
  approved: { label: "Verified", tone: "bg-success-50 text-success-700 ring-success-200", icon: CheckCircle2 },
  pending: { label: "Pending Verification", tone: "bg-warning-50 text-warning-700 ring-warning-200", icon: Clock },
  action_required: { label: "Verification Required", tone: "bg-warning-50 text-warning-700 ring-warning-200", icon: FileQuestion },
  not_required: { label: "Not Required", tone: "bg-neutral-100 text-neutral-700 ring-neutral-200", icon: FileQuestion },
};

/**
 * Backend-authoritative verification status. The provider can never change it —
 * this badge only reflects what the backend returns.
 */
export function ServiceProviderVerificationBadge({
  status,
  className,
}: {
  status: ServiceProviderVerificationStatus;
  className?: string;
}) {
  const config = VERIFICATION_CONFIG[status] ?? VERIFICATION_CONFIG.not_required;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        config.tone,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {config.label}
    </span>
  );
}