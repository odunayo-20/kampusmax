"use client";

import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FULFILLMENT_CONFIRMATION_META } from "@/config/service-order";
import type { FulfillmentConfirmationStatus } from "@/types/booking";

const STYLES: Record<FulfillmentConfirmationStatus, string> = {
  not_required: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  awaiting: "bg-info-50 text-info-700 ring-info-200",
  confirmed: "bg-success-50 text-success-700 ring-success-200",
  problem_reported: "bg-error-50 text-error-700 ring-error-200",
};

const ICONS: Record<FulfillmentConfirmationStatus, typeof CheckCircle> = {
  not_required: CheckCircle,
  awaiting: Clock,
  confirmed: BadgeCheck,
  problem_reported: AlertTriangle,
};

const PERSPECTIVE_LABELS: Record<FulfillmentConfirmationStatus, Record<"customer" | "provider", string>> = {
  not_required: { customer: "Auto-confirmed", provider: "Auto-confirmed" },
  awaiting: { customer: "Awaiting your confirmation", provider: "Awaiting customer confirmation" },
  confirmed: { customer: "Confirmed complete", provider: "Confirmed complete" },
  problem_reported: { customer: "Issue reported", provider: "Issue reported" },
};

/**
 * Fulfilment sub-state badge: sits next to the booking status when a completed
 * order still needs the customer's confirmation, was confirmed, or has a
 * reported issue. Hidden for the routine auto-confirmed case unless requested.
 */
export function FulfillmentStatusBadge({
  status,
  perspective = "customer",
  showAlways = false,
  className,
}: {
  status: FulfillmentConfirmationStatus;
  perspective?: "customer" | "provider";
  showAlways?: boolean;
  className?: string;
}) {
  if (!showAlways && status === "not_required") return null;
  const Icon = ICONS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        STYLES[status] ?? STYLES.not_required,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {PERSPECTIVE_LABELS[status][perspective]}
    </span>
  );
}

export { FULFILLMENT_CONFIRMATION_META };