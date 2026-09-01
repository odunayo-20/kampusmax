"use client";

import {
  AlertTriangle,
  BadgeCheck,
  MessageSquarePlus,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CUSTOMER_CONFIRMATION_BODY, CUSTOMER_CONFIRMATION_HEADING } from "@/config/service-order";
import { formatBookingDate } from "@/services/booking";
import type { ServiceBooking } from "@/types/booking";

/**
 * Customer post-completion gate. Renders only for orders that need (or got)
 * customer action: awaiting confirmation, confirmed, or problem reported.
 */
export function CompletionCard({
  booking,
  canReview,
  onConfirm,
  onReport,
  onReview,
}: {
  booking: ServiceBooking;
  canReview: boolean;
  onConfirm: () => void;
  onReport: () => void;
  onReview: () => void;
}) {
  const f = booking.fulfillment;
  if (f.confirmationStatus === "not_required") return null;

  if (f.confirmationStatus === "awaiting") {
    return (
      <div className="rounded-xl border border-info-200 bg-info-50 p-3.5">
        <p className="text-xs font-bold text-info-800">{CUSTOMER_CONFIRMATION_HEADING}</p>
        <p className="mt-1 text-xs leading-relaxed text-info-700">{CUSTOMER_CONFIRMATION_BODY}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-success-600 px-3 py-2 text-xs font-bold text-white hover:bg-success-700"
          >
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> It&apos;s done, confirm
          </button>
          <button
            onClick={onReport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-xs font-bold text-error-700 hover:bg-error-100"
          >
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Report a problem
          </button>
        </div>
      </div>
    );
  }

  if (f.confirmationStatus === "problem_reported") {
    return (
      <div className="rounded-xl border border-error-200 bg-error-50 p-3.5">
        <p className="flex items-center gap-1.5 text-xs font-bold text-error-800">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Issue reported
        </p>
        <p className="mt-1 text-xs leading-relaxed text-error-700">
          {f.problem?.description ?? "Your issue was reported."} It&apos;s been handed to Kampmax
          support for review — you&apos;ll be updated here and in your notifications.
        </p>
      </div>
    );
  }

  if (f.confirmationStatus === "confirmed") {
    const confirmedLabel = f.customerConfirmedAt
      ? `Confirmed complete on ${formatBookingDate(f.customerConfirmedAt)}`
      : "Confirmed complete";
    return (
      <div
        className={cn(
          "rounded-xl border p-3.5",
          canReview ? "border-success-200 bg-success-50" : "border-neutral-200 bg-white"
        )}
      >
        <p className="flex items-center gap-1.5 text-xs font-bold text-success-700">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> {confirmedLabel}
        </p>
        {f.review ? (
          <p className="mt-1.5 text-xs text-neutral-600">
            You rated this booking {f.review.rating}/5{f.review.title ? ` — “${f.review.title}”` : ""}.
            Thanks for sharing your experience.
          </p>
        ) : canReview ? (
          <>
            <p className="mt-1 text-xs leading-relaxed text-success-800">
              Thanks for confirming. Your review window is open — rate {booking.serviceName}
              while it&apos;s fresh.
            </p>
            <button
              onClick={onReview}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-bold text-primary-700 hover:bg-primary-100"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden /> Leave a review
            </button>
          </>
        ) : (
          <p className="mt-1 text-xs text-neutral-500">
            The review window for this booking has closed.
          </p>
        )}
      </div>
    );
  }

  return null;
}