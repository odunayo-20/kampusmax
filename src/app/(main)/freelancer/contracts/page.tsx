"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getFreelancerContracts } from "@/services/contract";
import { ContractCard } from "@/components/contracts/ContractCard";
import { ContractEmptyState } from "@/components/contracts/ContractEmptyState";
import type { Contract, ContractStatus } from "@/types/contract";
import { CONTRACT_STATUS } from "@/types/contract";

// Freelancer contracts page with status filters. Data comes from the backend
// (services/contract). No fake production data.

type FilterKey = "ALL" | ContractStatus;

const FILTERS: { key: FilterKey; label: string; match: (c: Contract) => boolean }[] = [
  { key: "ALL", label: "All", match: () => true },
  { key: CONTRACT_STATUS.ACTIVE, label: "Active", match: (c) => c.status === CONTRACT_STATUS.ACTIVE },
  { key: CONTRACT_STATUS.PENDING_ACCEPTANCE, label: "Pending", match: (c) => c.status === CONTRACT_STATUS.PENDING_ACCEPTANCE },
  { key: CONTRACT_STATUS.AWAITING_CLIENT_REVIEW, label: "Awaiting Review", match: (c) => c.status === CONTRACT_STATUS.AWAITING_CLIENT_REVIEW },
  { key: CONTRACT_STATUS.REVISION_REQUESTED, label: "Revisions", match: (c) => c.status === CONTRACT_STATUS.REVISION_REQUESTED },
  { key: CONTRACT_STATUS.COMPLETED, label: "Completed", match: (c) => c.status === CONTRACT_STATUS.COMPLETED },
  { key: CONTRACT_STATUS.CANCELLED, label: "Cancelled", match: (c) => c.status === CONTRACT_STATUS.CANCELLED },
  { key: CONTRACT_STATUS.DISPUTED, label: "Disputed", match: (c) => c.status === CONTRACT_STATUS.DISPUTED },
];

export default function FreelancerContractsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");
  const [contracts] = useState(() => getFreelancerContracts());

  const activeContractCount = contracts.filter(
    (c) => c.status !== CONTRACT_STATUS.COMPLETED && c.status !== CONTRACT_STATUS.CANCELLED
  ).length;
  const activeFilterDef = FILTERS.find((f) => f.key === activeFilter) ?? FILTERS[0];
  const filtered = contracts.filter(activeFilterDef.match);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-kampmax-text">Contracts</h1>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          {activeContractCount > 0
            ? `You have ${activeContractCount} active contract${activeContractCount !== 1 ? "s" : ""}.`
            : "Your freelance contracts and projects."}
        </p>
      </header>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter contracts by status">
        {FILTERS.map((filter) => {
          const count = contracts.filter(filter.match).length;
          const active = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                active
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-kampmax-border bg-white text-kampmax-text hover:border-primary-400 hover:text-primary-700"
              )}
            >
              {filter.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs font-semibold",
                  active ? "bg-white/20 text-white" : "bg-kampmax-muted text-kampmax-text-secondary"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <ContractEmptyState
          title="No contracts here yet"
          body="When a client accepts your proposal, your contract and project workspace will appear here."
          actionLabel="Browse services"
          actionHref="/services"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((contract) => (
            <ContractCard key={contract.id} contract={contract} />
          ))}
        </div>
      )}
    </div>
  );
}
