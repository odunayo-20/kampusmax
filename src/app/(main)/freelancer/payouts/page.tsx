"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  getPayoutAccount,
  getPayoutEligibility,
  getPayouts,
  requestPayout,
} from "@/services/freelancer-financials";
import type { FlPayoutRequestInput, FlPayoutRequestResult, FlPayoutStatus } from "@/types/freelancer-financials";
import { FL_PAYOUT_FILTER_TABS } from "@/config/freelancer-financials";
import { cn } from "@/lib/utils";
import { FlFinancialSubnav } from "@/components/freelancer/financials/FlFinancialSubnav";
import { FlPayoutsTable } from "@/components/freelancer/financials/FlPayoutsTable";
import { FlPagination } from "@/components/freelancer/financials/FlPagination";
import { FlPayoutRequestModal } from "@/components/freelancer/financials/FlPayoutRequestModal";
import { FlFinancialEmptyState } from "@/components/freelancer/financials/FlFinancialEmptyState";

// Withdrawals page (spec §28–§29). Status tabs filter the payout history; the
// "New withdrawal" button opens the idempotency-keyed, backend-validated modal.

type TabKey = FlPayoutStatus | "all";

export default function FreelancerPayoutsPage() {
  const [tab, setTab] = useState<TabKey>("all");
  const [pageNum, setPageNum] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [account] = useState(() => getPayoutAccount());
  const [eligibility] = useState(() => getPayoutEligibility());

  const page = useMemo(
    () => getPayouts({ page: pageNum, pageSize: 10, status: tab }),
    [tab, pageNum]
  );

  const handleSubmit = (input: FlPayoutRequestInput): FlPayoutRequestResult =>
    requestPayout(input);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <header>
          <h1 className="text-xl font-bold text-kampmax-text">Withdrawals</h1>
          <p className="mt-1 text-sm text-kampmax-text-secondary">
            Funds withdrawn to your verified bank account.
          </p>
        </header>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={!eligibility.canRequest}
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-[#1258C7] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden /> New withdrawal
        </button>
      </div>

      <FlFinancialSubnav />

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter withdrawals by status">
        {FL_PAYOUT_FILTER_TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => { setTab(t.key); setPageNum(1); }}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                active
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-kampmax-border bg-white text-kampmax-text hover:border-primary-400 hover:text-primary-700"
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {!eligibility.canRequest && eligibility.reason && (
        <p className="rounded-lg bg-kampmax-muted px-3 py-2 text-sm text-kampmax-text-secondary">
          {eligibility.reason}
        </p>
      )}

      {page.items.length === 0 ? (
        <FlFinancialEmptyState
          title="No withdrawals yet"
          message="When you withdraw funds, they’ll show up here with their status."
          actionLabel="Withdraw funds"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <>
          <FlPayoutsTable payouts={page.items} />
          <FlPagination
            page={page.page}
            totalPages={page.totalPages}
            total={page.total}
            pageSize={page.pageSize}
            itemLabel="withdrawals"
            onPageChange={setPageNum}
          />
        </>
      )}

      <FlPayoutRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        account={account}
        available={eligibility.available ?? 0}
      />
    </div>
  );
}
