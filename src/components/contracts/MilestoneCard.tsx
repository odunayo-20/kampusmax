"use client";

import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/utils";
import { MilestoneStatusBadge } from "./ContractStatusBadge";
import { ContractDeadline } from "./ContractDeadline";
import { formatDate } from "@/lib/utils";
import type { Milestone } from "@/types/contract";

// Milestone card for list views — status, due date, deliverable count, and
// optional monetary display (information only; never used for payout math).
export function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const completedDeliverables = milestone.deliverables.filter(
    (d) => d.status === "COMPLETED" || d.status === "APPROVED"
  ).length;

  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-kampmax-text">{milestone.title}</h3>
          {milestone.description && (
            <p className="mt-1 text-sm text-kampmax-text-secondary">
              {milestone.description}
            </p>
          )}
        </div>
        <MilestoneStatusBadge status={milestone.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        {milestone.dueDate && (
          <ContractDeadline dueDate={milestone.dueDate} />
        )}
        {milestone.deliverables.length > 0 && (
          <span className="text-sm text-kampmax-text-secondary">
            {completedDeliverables} / {milestone.deliverables.length} deliverables complete
          </span>
        )}
        {milestone.completedAt && (
          <span className="text-sm text-kampmax-text-secondary">
            Completed {formatDate(milestone.completedAt)}
          </span>
        )}
      </div>

      {milestone.deliverables.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-kampmax-border pt-3">
          {milestone.deliverables.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span
                className={cn(
                  "truncate",
                  d.status === "COMPLETED" || d.status === "APPROVED"
                    ? "text-kampmax-text-secondary line-through"
                    : "text-kampmax-text"
                )}
              >
                {d.title}
              </span>
              <span className="shrink-0">
                <MilestoneDeliverableDot status={d.status} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MilestoneDeliverableDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETED: "bg-success-500",
    APPROVED: "bg-success-500",
    REVISION_REQUESTED: "bg-accent-500",
    UNDER_REVIEW: "bg-info-500",
    SUBMITTED: "bg-info-500",
    DRAFT: "bg-neutral-300",
  };
  return (
    <span
      className={cn("inline-block h-2.5 w-2.5 rounded-full", map[status] ?? "bg-neutral-300")}
      aria-label={`Deliverable status: ${status.replace(/_/g, " ").toLowerCase()}`}
    />
  );
}

// A tiny formatter re-export guard so callers can show milestone amounts if the
// backend provides them (display only).
export function formatMilestoneAmount(value?: number, currency = "NGN"): string | null {
  if (typeof value !== "number") return null;
  return currency === "NGN" ? formatNaira(value) : `${value}`;
}
