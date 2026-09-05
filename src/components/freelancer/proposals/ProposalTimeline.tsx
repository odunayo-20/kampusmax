"use client";

import { Check } from "lucide-react";
import type { Proposal } from "@/types/opportunity";
import { PROPOSAL_STATUS } from "@/types/opportunity";
import { PROPOSAL_STATUS_META } from "@/config/opportunity";
import { cn, formatDateTime } from "@/lib/utils";
import { ProposalStatusBadge } from "../opportunities/StatusBadges";

export function ProposalTimeline({ proposal }: { proposal: Proposal }) {
  const events = [...proposal.timeline].sort(
    (a, b) => +new Date(a.at) - +new Date(b.at)
  );

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-500">
        No timeline events yet.
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {events.map((ev, idx) => {
        const last = idx === events.length - 1;
        return (
          <li key={ev.id} className="relative flex gap-3 pb-4">
            {!last && (
              <span
                aria-hidden
                className="absolute left-[11px] top-6 bottom-0 w-px bg-neutral-200"
              />
            )}
            <span
              className={cn(
                "mt-0.5 flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full border",
                last
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-neutral-300 bg-white text-neutral-400"
              )}
            >
              <Check className="h-3 w-3" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-neutral-900">{ev.label}</p>
                <ProposalStatusBadge status={ev.status} />
              </div>
              <p className="text-xs text-neutral-500">{formatDateTime(ev.at)}</p>
              {ev.status === PROPOSAL_STATUS.ACCEPTED && (
                <p className="mt-1 text-xs text-neutral-600">
                  {PROPOSAL_STATUS_META[ev.status].hint}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
