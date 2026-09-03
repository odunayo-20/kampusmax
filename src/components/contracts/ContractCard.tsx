"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { formatNaira, timeAgo } from "@/lib/utils";
import { ContractStatusBadge } from "./ContractStatusBadge";
import { ContractProgressMini } from "./ContractProgress";
import { ContractDeadline } from "./ContractDeadline";
import { getContractActionTitle } from "@/lib/contract-utils";
import type { Contract } from "@/types/contract";

// Contract card for list/grid views — surfaces the most important info at a
// glance: status, progress, next action, deadline, client, and price (display
// only — never used for financial calculation).
export function ContractCard({ contract }: { contract: Contract }) {
  return (
    <Link
      href={`/freelancer/contracts/${contract.id}`}
      className="group flex flex-col rounded-xl border border-kampmax-border bg-white p-5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-kampmax-text">
            {contract.projectTitle}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <Avatar name={contract.client.displayName} src={contract.client.avatar} size="sm" />
            <span className="truncate text-sm text-kampmax-text-secondary">
              {contract.client.displayName}
            </span>
          </div>
        </div>
        <ContractStatusBadge status={contract.status} />
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-kampmax-text-secondary">
            {contract.completedMilestones} of {contract.totalMilestones} milestones completed
          </span>
          <span className="text-xs font-semibold text-kampmax-text">{contract.progress}%</span>
        </div>
        <ContractProgressMini value={contract.progress} />
      </div>

      {/* Next action */}
      <div className="mt-4 rounded-lg bg-kampmax-muted/70 px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-kampmax-text-secondary">
          {getContractActionTitle(contract.status)}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm text-kampmax-text">
          {contract.nextAction}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <ContractDeadline dueDate={contract.deadline} status={contract.status} />
        <div className="flex items-center gap-3">
          {typeof contract.agreedAmount === "number" && (
            <span className="text-sm font-semibold text-kampmax-text">
              {formatNaira(contract.agreedAmount)}
            </span>
          )}
          <span className="hidden text-xs text-kampmax-text-muted sm:inline">
            {timeAgo(contract.lastActivity)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
            Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>

      {contract.outstandingDeliverables > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-kampmax-text-secondary">
          <FileText className="h-3.5 w-3.5" aria-hidden />
          {contract.outstandingDeliverables} outstanding deliverable
          {contract.outstandingDeliverables !== 1 ? "s" : ""}
        </div>
      )}
    </Link>
  );
}
