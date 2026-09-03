"use client";

import { CheckCircle2, Clock, Ban, XCircle, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FreelancerOnboardingStatus } from "@/types/freelancer";
import { FREELANCER_ONBOARDING_STATUS } from "@/types/freelancer";

const FL_STATUS_CONFIG: Record<
  FreelancerOnboardingStatus,
  { label: string; tone: string; icon: typeof CheckCircle2 }
> = {
  DRAFT: { label: "Draft", tone: "bg-neutral-100 text-neutral-700 ring-neutral-200", icon: FileQuestion },
  IN_PROGRESS: { label: "In Progress", tone: "bg-info-50 text-info-700 ring-info-200", icon: Clock },
  PENDING_REVIEW: { label: "Under Review", tone: "bg-warning-50 text-warning-700 ring-warning-200", icon: Clock },
  APPROVED: { label: "Active", tone: "bg-success-50 text-success-700 ring-success-200", icon: CheckCircle2 },
  REJECTED: { label: "Needs Changes", tone: "bg-error-50 text-error-700 ring-error-200", icon: XCircle },
  SUSPENDED: { label: "Suspended", tone: "bg-error-50 text-error-700 ring-error-200", icon: Ban },
};

/**
 * Screen-reader-friendly status indicator for the freelancer profile. Status is
 * backend-authoritative and never communicated through color alone.
 */
export function FreelancerStatusBadge({
  status,
  className,
}: {
  status: FreelancerOnboardingStatus;
  className?: string;
}) {
  const config = FL_STATUS_CONFIG[status] ?? FL_STATUS_CONFIG[FREELANCER_ONBOARDING_STATUS.DRAFT];
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
