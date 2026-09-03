"use client";

import {
  FilePlus2,
  Handshake,
  Rocket,
  Milestone,
  Upload,
  Eye,
  RotateCcw,
  BadgeCheck,
  Flag,
  Ban,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import { TIMELINE_EVENT_META } from "@/config/contract";
import type { ContractTimelineEvent, TimelineEventType } from "@/types/contract";

// Clean vertical project timeline. Only backend-provided events are rendered —
// the frontend never fabricates timeline entries.

const EVENT_DOT: Record<TimelineEventType, string> = {
  CONTRACT_CREATED: "bg-neutral-300",
  CONTRACT_ACCEPTED: "bg-success-500",
  PROJECT_STARTED: "bg-primary-500",
  MILESTONE_STARTED: "bg-primary-400",
  DELIVERABLE_SUBMITTED: "bg-info-500",
  CLIENT_REVIEWED: "bg-info-500",
  REVISION_REQUESTED: "bg-accent-500",
  DELIVERABLE_RESUBMITTED: "bg-info-500",
  DELIVERABLE_APPROVED: "bg-success-500",
  MILESTONE_COMPLETED: "bg-success-500",
  PROJECT_COMPLETED: "bg-success-600",
  CONTRACT_CANCELLED: "bg-error-500",
  DISPUTE_OPENED: "bg-error-500",
};

const EVENT_ICON: Record<TimelineEventType, LucideIcon> = {
  CONTRACT_CREATED: FilePlus2,
  CONTRACT_ACCEPTED: Handshake,
  PROJECT_STARTED: Rocket,
  MILESTONE_STARTED: Milestone,
  DELIVERABLE_SUBMITTED: Upload,
  CLIENT_REVIEWED: Eye,
  REVISION_REQUESTED: RotateCcw,
  DELIVERABLE_RESUBMITTED: Upload,
  DELIVERABLE_APPROVED: BadgeCheck,
  MILESTONE_COMPLETED: BadgeCheck,
  PROJECT_COMPLETED: Flag,
  CONTRACT_CANCELLED: Ban,
  DISPUTE_OPENED: AlertTriangle,
};

export function ContractTimeline({
  events,
  className,
}: {
  events: ContractTimelineEvent[];
  className?: string;
}) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-kampmax-text-secondary">
        No activity yet on this contract.
      </p>
    );
  }

  return (
    <ol className={cn("relative space-y-0", className)} aria-label="Project timeline">
      {events.map((event, idx) => {
        const Icon = EVENT_ICON[event.type] ?? FilePlus2;
        const isLast = idx === events.length - 1;
        return (
          <li key={event.id} className="relative flex gap-3.5 pb-6 last:pb-0">
            {/* connector */}
            {!isLast && (
              <span
                className="absolute left-[13px] top-7 h-full w-px bg-kampmax-border"
                aria-hidden
              />
            )}
            {/* dot */}
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 ring-kampmax-border",
                EVENT_DOT[event.type]
              )}
              aria-hidden
            >
              <Icon className="h-3.5 w-3.5 text-white" />
            </span>
            {/* content */}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-sm font-semibold text-kampmax-text">
                  {TIMELINE_EVENT_META[event.type]?.label ?? event.type}
                </p>
                <time className="text-xs text-kampmax-text-muted" dateTime={event.timestamp}>
                  {formatDateTime(event.timestamp)}
                </time>
              </div>
              <p className="mt-0.5 text-sm text-kampmax-text-secondary">
                {event.description}
              </p>
              <p className="mt-0.5 text-xs text-kampmax-text-muted">
                by {event.actor.displayName}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
