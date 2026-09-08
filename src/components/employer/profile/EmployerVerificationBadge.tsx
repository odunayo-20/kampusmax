"use client";

import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui";
import { EMPLOYER_VERIFICATION_STATUS } from "@/types/employer";
import type { EmployerVerificationStatus } from "@/types/employer";

const VERIFICATION_META: Record<
  EmployerVerificationStatus,
  { label: string; variant: "success" | "warning" | "info" | "error" | "default"; hint: string }
> = {
  verified: {
    label: "Verified",
    variant: "success",
    hint: "This employer's identity has been verified by Kampmax.",
  },
  pending: {
    label: "Verification pending",
    variant: "warning",
    hint: "Our team is reviewing this profile. We'll notify you when it's confirmed.",
  },
  rejected: {
    label: "Verification rejected",
    variant: "error",
    hint: "We couldn't verify this profile. Contact support for help.",
  },
  action_required: {
    label: "Action required",
    variant: "info",
    hint: "We need more information to complete verification.",
  },
  not_started: {
    label: "Not verified",
    variant: "default",
    hint: "Verification isn't complete. You'll still be able to use Kampmax while it's pending.",
  },
};

/**
 * Displays the backend-owned verification status. The employer can never set
 * this — it only reads `EmployerVerificationStatus` from the store.
 */
export function EmployerVerificationBadge({
  status,
}: {
  status: EmployerVerificationStatus;
}) {
  const meta = VERIFICATION_META[status] ?? VERIFICATION_META.not_started;
  const Icon = status === "verified" ? ShieldCheck : ShieldAlert;

  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={meta.hint}
      role="status"
      aria-label={`Verification: ${meta.label}`}
    >
      <Badge variant={meta.variant}>
        <Icon className="mr-1 h-3.5 w-3.5" aria-hidden />
        {meta.label}
      </Badge>
      <span className="sr-only">{meta.hint}</span>
    </span>
  );
}
