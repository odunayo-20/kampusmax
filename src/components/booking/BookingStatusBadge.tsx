"use client";

import {
  Clock,
  BadgeCheck,
  Loader,
  CircleCheck,
  CircleX,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TONE,
  type BookingStatus,
} from "@/types/booking";

const TONE_CLASSES: Record<BookingStatus, string> = {
  pending: "bg-warning-50 text-warning-700 ring-warning-200",
  confirmed: "bg-success-50 text-success-700 ring-success-200",
  in_progress: "bg-info-50 text-info-700 ring-info-200",
  completed: "bg-success-50 text-success-700 ring-success-200",
  cancelled: "bg-error-50 text-error-700 ring-error-200",
  declined: "bg-neutral-100 text-neutral-700 ring-neutral-200",
};

const STATUS_ICON = {
  pending: Clock,
  confirmed: BadgeCheck,
  in_progress: Loader,
  completed: CircleCheck,
  cancelled: CircleX,
  declined: Ban,
} as const;

/**
 * Booking status badge. Never communicates state through color alone — the
 * label text and a semantic icon always travel with it.
 */
export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  const Icon = STATUS_ICON[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        TONE_CLASSES[status] ?? TONE_CLASSES.pending,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}

/** Small lookup helper for tone colors used in non-badge surfaces. */
export { BOOKING_STATUS_TONE };