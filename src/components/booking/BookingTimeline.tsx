"use client";

import { cn } from "@/lib/utils";
import type { BookingTimelineEvent } from "@/types/booking";

const KIND_STYLES: Record<BookingTimelineEvent["kind"], string> = {
  created: "bg-primary-500",
  accepted: "bg-success-500",
  declined: "bg-neutral-400",
  started: "bg-info-500",
  rescheduled: "bg-warning-500",
  cancelled: "bg-error-500",
  completed: "bg-success-500",
  completion_confirmed: "bg-success-500",
  problem_reported: "bg-error-500",
  reviewed: "bg-warning-500",
};

/** Vertical booking timeline (backend events, rendered oldest → newest). */
export function BookingTimeline({
  timeline,
  className,
}: {
  timeline: BookingTimelineEvent[];
  className?: string;
}) {
  const ordered = [...timeline].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (ordered.length === 0) {
    return (
      <p className="text-xs text-neutral-400">No timeline events yet.</p>
    );
  }

  return (
    <ol className={cn("space-y-0", className)}>
      {ordered.map((event, idx) => {
        const isLast = idx === ordered.length - 1;
        return (
          <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                aria-hidden
                className={cn(
                  "mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-white",
                  KIND_STYLES[event.kind] ?? KIND_STYLES.created
                )}
              />
              {!isLast && <span aria-hidden className="w-px flex-1 bg-neutral-200" />}
            </div>
            <div className="min-w-0 pb-1">
              <p className="text-sm font-semibold text-neutral-900">{event.title}</p>
              {event.message && (
                <p className="mt-0.5 text-xs text-neutral-500">{event.message}</p>
              )}
              <p className="mt-0.5 text-[11px] text-neutral-400">
                {new Intl.DateTimeFormat("en-NG", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(event.createdAt))}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}