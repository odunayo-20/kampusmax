"use client";

import { formatNaira, formatDate } from "@/lib/utils";
import { ContractDeadline } from "./ContractDeadline";
import { ContractProgress } from "./ContractProgress";
import { ContractStatusBadge } from "./ContractStatusBadge";
import { Avatar } from "@/components/atoms/Avatar";
import type { Contract } from "@/types/contract";

// Contract overview panel — the key facts at a glance: status, client, dates,
// progress, amount (display only). No financial logic.

export function ContractOverview({ contract }: { contract: Contract }) {
  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <ClientInfo contract={contract} />
        <ContractStatusBadge status={contract.status} />
      </div>

      <ContractProgress
        value={contract.progress}
        label="Project Progress"
        milestoneText={`${contract.completedMilestones} of ${contract.totalMilestones} milestones completed`}
        className="mt-5"
      />

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-2">
        <InfoItem label="Start date" value={formatDate(contract.startDate)} />
        <InfoItem label="Deadline">
          <ContractDeadline dueDate={contract.deadline} status={contract.status} />
        </InfoItem>
        {typeof contract.agreedAmount === "number" && (
          <InfoItem label="Agreed amount" value={formatNaira(contract.agreedAmount)} />
        )}
        <InfoItem label="Milestones" value={`${contract.completedMilestones} / ${contract.totalMilestones}`} />
        <InfoItem label="Last activity" value={formatDate(contract.lastActivity)} />
        {contract.disputeStatus && (
          <InfoItem label="Dispute status" value={contract.disputeStatus.replace(/_/g, " ")} />
        )}
      </dl>
    </div>
  );
}

function ClientInfo({ contract }: { contract: Contract }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar
        name={contract.client.displayName}
        src={contract.client.avatar}
        size="md"
        className="shrink-0"
      />
      <div className="min-w-0">
        <p className="text-xs text-kampmax-text-secondary">Client</p>
        <p className="truncate text-sm font-bold text-kampmax-text">
          {contract.client.displayName}
        </p>
        {contract.client.organization && (
          <p className="truncate text-xs text-kampmax-text-secondary">
            {contract.client.organization}
          </p>
        )}
        {contract.client.verified && (
          <p className="mt-0.5 text-xs font-medium text-success-700">
            ✓ Verified
          </p>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-kampmax-text-secondary">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-kampmax-text">
        {value ?? children}
      </dd>
    </div>
  );
}
