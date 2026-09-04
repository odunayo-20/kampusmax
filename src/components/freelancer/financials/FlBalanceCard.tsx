"use client";

import { Wallet, RefreshCw } from "lucide-react";
import { formatNaira, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { FlBalance, FlPayoutEligibility } from "@/types/freelancer-financials";
import { FL_PAYOUT_ELIGIBILITY } from "@/types/freelancer-financials";
import { FL_PAYOUT_ELIGIBILITY_META } from "@/config/freelancer-financials";

// Balance card (spec §8). Every value is backend-supplied; the frontend never
// derives or edits the balance. Action buttons are disabled based on the
// backend-provided eligibility.

const ELIGIBILITY_TONE: Record<string, string> = {
  [FL_PAYOUT_ELIGIBILITY.ELIGIBLE]: "border-kampmax-success/30 bg-success-50 text-kampmax-success",
  [FL_PAYOUT_ELIGIBILITY.PENDING_PAYOUT]: "border-kampmax-info/30 bg-info-50 text-kampmax-info",
  [FL_PAYOUT_ELIGIBILITY.BELOW_MINIMUM]: "border-kampmax-border bg-kampmax-muted text-kampmax-text-secondary",
  [FL_PAYOUT_ELIGIBILITY.ACCOUNT_VERIFICATION_REQUIRED]: "border-kampmax-info/30 bg-info-50 text-kampmax-info",
  [FL_PAYOUT_ELIGIBILITY.PAYOUT_METHOD_REQUIRED]: "border-kampmax-info/30 bg-info-50 text-kampmax-info",
  [FL_PAYOUT_ELIGIBILITY.TEMPORARILY_DISABLED]: "border-kampmax-border bg-kampmax-muted text-kampmax-text-secondary",
  [FL_PAYOUT_ELIGIBILITY.RESTRICTED]: "border-error-100 bg-error-50 text-error-700",
};

export function FlBalanceCard({
  balance,
  eligibility,
  onRequestPayout,
  onViewPayoutMethod,
  onRefresh,
}: {
  balance: FlBalance;
  eligibility: FlPayoutEligibility;
  onRequestPayout: () => void;
  onViewPayoutMethod: () => void;
  onRefresh: () => void;
}) {
  const meta = FL_PAYOUT_ELIGIBILITY_META[eligibility.status];
  const needsAccount =
    eligibility.status === FL_PAYOUT_ELIGIBILITY.PAYOUT_METHOD_REQUIRED ||
    eligibility.status === FL_PAYOUT_ELIGIBILITY.ACCOUNT_VERIFICATION_REQUIRED;

  return (
    <section aria-labelledby="balance-heading" className="rounded-xl border border-kampmax-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="balance-heading" className="flex items-center gap-2 text-sm font-semibold text-kampmax-text">
            <Wallet className="h-4 w-4 text-kampmax-text-secondary" aria-hidden />
            Available Balance
          </h2>
          <p className="mt-2 text-3xl font-bold text-kampmax-text">{formatNaira(balance.available)}</p>
          <p className="mt-1 text-sm text-kampmax-text-secondary">
            Pending: <span className="font-medium text-kampmax-text">{formatNaira(balance.pending)}</span>
          </p>
          <p className="mt-1 text-xs text-kampmax-text-muted">Updated {formatDateTime(balance.asOf)}</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 py-1.5 text-sm font-medium text-kampmax-text hover:bg-kampmax-muted"
        >
          <RefreshCw className="h-4 w-4" aria-hidden /> Refresh
        </button>
      </div>

      <div
        className={cn(
          "mt-4 rounded-lg border px-3 py-2.5 text-sm",
          ELIGIBILITY_TONE[eligibility.status]
        )}
      >
        <span className="font-semibold">Status: {meta.label}</span>
        {eligibility.reason && <p className="mt-0.5 text-xs">{eligibility.reason}</p>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRequestPayout}
          disabled={!eligibility.canRequest}
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-[#1258C7] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
        >
          Withdraw
        </button>
        <button
          type="button"
          onClick={onViewPayoutMethod}
          className="inline-flex h-10 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-4 text-sm font-semibold text-kampmax-text hover:bg-kampmax-muted"
        >
          {needsAccount ? "Add payout method" : "View payout method"}
        </button>
      </div>
    </section>
  );
}
