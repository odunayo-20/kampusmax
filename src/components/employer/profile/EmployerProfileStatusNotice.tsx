"use client";

import Link from "next/link";
import { BadgeCheck, Info } from "lucide-react";
import type { EmployerOnboardingStatus } from "@/types/employer";
import { EMPLOYER_ONBOARDING_STATUS } from "@/types/employer";

const STATUS_LABEL: Record<EmployerOnboardingStatus, string> = {
  DRAFT: "Not submitted",
  IN_PROGRESS: "In progress",
  PENDING_REVIEW: "Under review",
  APPROVED: "Active",
  REJECTED: "Needs changes",
  SUSPENDED: "Suspended",
};

/**
 * An honest onboarding-state notice shown on the profile page when the
 * profile is not fully approved. Presents the state + a Continue Onboarding
 * CTA instead of hiding the profile behind a redirect.
 */
export function EmployerProfileStatusNotice({
  status,
}: {
  status: EmployerOnboardingStatus;
}) {
  let tone = "bg-info-50 text-info-700 border-info-200";
  let message = "Your employer profile is being set up.";

  switch (status) {
    case EMPLOYER_ONBOARDING_STATUS.PENDING_REVIEW:
      message = "Your profile is under review. You can still view and update it below.";
      break;
    case EMPLOYER_ONBOARDING_STATUS.REJECTED:
      tone = "bg-error-50 text-error-700 border-error-200";
      message = "Your profile needs changes before it can go live. Update it below and resubmit.";
      break;
    case EMPLOYER_ONBOARDING_STATUS.SUSPENDED:
      tone = "bg-error-50 text-error-700 border-error-200";
      message = "Your employer profile is currently unavailable. Contact support for help.";
      break;
    case EMPLOYER_ONBOARDING_STATUS.IN_PROGRESS:
      message = "Your profile is in progress. Finish the remaining steps to start hiring.";
      break;
    case EMPLOYER_ONBOARDING_STATUS.DRAFT:
      message = "You haven't submitted your employer profile yet.";
      break;
    default:
      break;
  }

  if (status === EMPLOYER_ONBOARDING_STATUS.APPROVED) return null;

  return (
    <div role="status" className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${tone}`}>
      <Info className="h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">
        {message} Status: <strong>{STATUS_LABEL[status]}</strong>.
      </span>
      <Link
        href="/onboarding/employer"
        className="rounded-md bg-white/60 px-3 py-1.5 text-xs font-semibold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
      >
        Continue onboarding
      </Link>
    </div>
  );
}
