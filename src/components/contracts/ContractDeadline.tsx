"use client";

import { CalendarClock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getDeadlineInfo, type DeadlineIntent } from "@/lib/contract-utils";
import type { ContractStatus } from "@/types/contract";

// Shows a deadline with clear, accessible text for every state — never
// colour-only. Uses the backend timestamp as the single source of truth.

const INTENT_TEXT: Record<DeadlineIntent, string> = {
  upcoming: "text-kampmax-text-secondary",
  due_soon: "text-accent-700",
  due_today: "text-accent-700",
  overdue: "text-error-700",
  completed: "text-success-700",
};

export function ContractDeadline({
  dueDate,
  status,
  className,
}: {
  dueDate: string;
  status?: ContractStatus;
  className?: string;
}) {
  const info = getDeadlineInfo(dueDate, status);
  const baseDate = formatDate(dueDate);

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {info.intent === "overdue" ? (
        <AlertTriangle className="h-4 w-4 shrink-0 text-error-600" aria-hidden />
      ) : info.intent === "completed" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success-600" aria-hidden />
      ) : (
        <CalendarClock className="h-4 w-4 shrink-0 text-kampmax-text-secondary" aria-hidden />
      )}
      <span className={`text-sm font-medium ${INTENT_TEXT[info.intent]}`}>
        <span className="sr-only">Deadline: </span>
        {info.intent === "upcoming" ? `Due ${baseDate}` : info.label}
      </span>
      {info.intent === "overdue" && (
        <span className="sr-only">, was due {baseDate}</span>
      )}
    </div>
  );
}
