"use client";

import { BadgeCheck, ShieldQuestion, ShieldAlert, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoreAvailabilityStatus, StoreVerificationStatus } from "@/types/storefront";
import { verificationLabel, availabilityLabel } from "@/services/storefront";

// ============================================================
// CUSTOMER-FACING STORE BADGES
// ============================================================
// Verification/availability are communicated with an icon AND text (never
// color alone). No internal verification reasons or moderation data are
// exposed here.

interface VerificationBadgeProps {
  status: StoreVerificationStatus;
  className?: string;
}

const VERIFICATION_STYLES: Record<StoreVerificationStatus, { icon: typeof BadgeCheck; classes: string }> = {
  verified: { icon: BadgeCheck, classes: "bg-success-50 text-success-700 border-success-100" },
  pending: { icon: ShieldQuestion, classes: "bg-accent-50 text-accent-700 border-accent-100" },
  unverified: { icon: ShieldAlert, classes: "bg-neutral-100 text-neutral-600 border-neutral-200" },
  restricted: { icon: XCircle, classes: "bg-error-50 text-error-700 border-error-100" },
};

export function StoreVerificationBadge({ status, className }: VerificationBadgeProps) {
  const { icon: Icon, classes } = VERIFICATION_STYLES[status] || VERIFICATION_STYLES.unverified;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border",
        classes,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {verificationLabel(status)}
    </span>
  );
}

interface AvailabilityBadgeProps {
  status: StoreAvailabilityStatus;
  className?: string;
}

const AVAILABILITY_STYLES: Record<StoreAvailabilityStatus, { classes: string }> = {
  active: { classes: "bg-success-50 text-success-700 border-success-100" },
  temporarily_unavailable: { classes: "bg-accent-50 text-accent-700 border-accent-100" },
  suspended: { classes: "bg-error-50 text-error-700 border-error-100" },
  closed: { classes: "bg-neutral-100 text-neutral-600 border-neutral-200" },
};

export function StoreAvailabilityBadge({ status, className }: AvailabilityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border",
        AVAILABILITY_STYLES[status].classes,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active" ? "bg-success-600" : "bg-current"
        )}
        aria-hidden
      />
      {availabilityLabel(status)}
    </span>
  );
}
