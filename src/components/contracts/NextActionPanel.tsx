"use client";

import { ArrowRight, CheckCircle2, Clock, Loader2, AlertTriangle, Ban } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getContractActionTitle } from "@/lib/contract-utils";
import type { Contract } from "@/types/contract";
import { CONTRACT_STATUS } from "@/types/contract";

// The prominent "Next Action" panel. The backend owns the underlying state; the
// frontend only translates that state into a clear, scannable UX and an optional
// call-to-action.

export function NextActionPanel({
  contract,
  onAccept,
  onSubmit,
  onResubmit,
  onComplete,
  onOpenWorkspace,
}: {
  contract: Contract;
  onAccept?: () => void;
  onSubmit?: () => void;
  onResubmit?: () => void;
  onComplete?: () => void;
  onOpenWorkspace?: () => void;
}) {
  const status = contract.status;
  const title = getContractActionTitle(status);

  let icon: LucideIcon = Clock;
  let tone: "info" | "success" | "warning" | "danger" = "info";
  let body: React.ReactNode = contract.nextAction;

  // Derive the tone/icon and optional action solely from backend-owned state.
  if (status === CONTRACT_STATUS.COMPLETED) {
    icon = CheckCircle2;
    tone = "success";
  } else if (status === CONTRACT_STATUS.CANCELLED) {
    icon = Ban;
    tone = "danger";
  } else if (status === CONTRACT_STATUS.DISPUTED) {
    icon = AlertTriangle;
    tone = "warning";
  } else if (status === CONTRACT_STATUS.AWAITING_CLIENT_REVIEW) {
    icon = Clock;
    tone = "info";
  } else if (status === CONTRACT_STATUS.PENDING_ACCEPTANCE) {
    icon = Clock;
    tone = "warning";
  } else {
    icon = Loader2;
    tone = "info";
  }

  const toneStyles = {
    info: "border-info-100 bg-info-50",
    success: "border-success-100 bg-success-50",
    warning: "border-accent-100 bg-accent-50",
    danger: "border-error-100 bg-error-50",
  } as const;

  const iconStyles = {
    info: "text-info-700",
    success: "text-success-700",
    warning: "text-accent-700",
    danger: "text-error-700",
  } as const;

  const Icon = icon;

  return (
    <section
      aria-label="Next action"
      className={cn("rounded-xl border p-5", toneStyles[tone])}
    >
      <div className="flex items-start gap-3.5">
        <div className={cn("mt-0.5 shrink-0", iconStyles[tone])}>
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-kampmax-text">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-kampmax-text-secondary">{body}</p>

          {(status === CONTRACT_STATUS.PENDING_ACCEPTANCE ||
            status === CONTRACT_STATUS.ACTIVE ||
            status === CONTRACT_STATUS.REVISION_REQUESTED) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {contract.canAccept && onAccept && (
                <ActionButton onClick={onAccept} label="Review & Accept Contract" />
              )}
              {status === CONTRACT_STATUS.REVISION_REQUESTED && onResubmit && (
                <ActionButton onClick={onResubmit} label="Update Deliverable" />
              )}
              {status === CONTRACT_STATUS.ACTIVE && onSubmit && (
                <ActionButton onClick={onSubmit} label="Submit Deliverable" />
              )}
              {contract.canComplete && onComplete && (
                <ActionButton onClick={onComplete} label="Mark Work Complete" />
              )}
              {contract.totalMilestones > 0 && onOpenWorkspace && (
                <ActionButton onClick={onOpenWorkspace} label="Open Workspace" outline />
              )}
            </div>
          )}

          {(status === CONTRACT_STATUS.COMPLETED ||
            status === CONTRACT_STATUS.CANCELLED ||
            status === CONTRACT_STATUS.DISPUTED) &&
            contract.totalMilestones > 0 &&
            onOpenWorkspace && (
              <div className="mt-4">
                <ActionButton onClick={onOpenWorkspace} label="View Project Details" outline />
              </div>
            )}
        </div>
      </div>
    </section>
  );
}

function ActionButton({
  onClick,
  label,
  outline,
}: {
  onClick: () => void;
  label: string;
  outline?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2",
        outline
          ? "border border-kampmax-border bg-white text-kampmax-text hover:bg-neutral-50"
          : "bg-primary-600 text-white hover:bg-[#1258C7]"
      )}
    >
      {label} <ArrowRight className="h-4 w-4" aria-hidden />
    </button>
  );
}
