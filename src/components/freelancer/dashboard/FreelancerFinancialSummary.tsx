"use client";

import Link from "next/link";
import { Wallet, ArrowUpRight, Clock } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import {
  getFinancialOverview,
  getPayoutEligibility,
} from "@/services/freelancer-financials";

// Dashboard widget (spec §7 integration). Backend-computed balance only — the
// widget renders what the service returns and never derives money.

export function FreelancerFinancialSummary() {
  const [balance, cards, eligibility] = (() => {
    try {
      const overview = getFinancialOverview();
      return [overview.balance, overview.cards, getPayoutEligibility()];
    } catch {
      return [null, [], null];
    }
  })();

  if (!balance) return null;

  const totalEarnedCard = cards.find((c) => c.key === "totalEarned");

  return (
    <Link
      href="/freelancer/earnings"
      className="group block rounded-xl border border-kampmax-border bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
            <Wallet className="h-5 w-5" aria-hidden />
          </div>
          <h2 className="text-sm font-bold text-kampmax-text">Earnings</h2>
        </div>
        <ArrowUpRight className="h-4 w-4 text-kampmax-text-secondary group-hover:text-primary-600" aria-hidden />
      </div>

      <p className="mt-4 text-2xl font-bold text-kampmax-text">
        {formatNaira(balance.available)}
      </p>
      <p className="text-xs text-kampmax-text-secondary">Available balance</p>

      <div className="mt-3 space-y-1.5 text-sm">
        <p className="flex items-center justify-between text-kampmax-text-secondary">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden /> Pending
          </span>
          <span className="font-medium text-kampmax-text">{formatNaira(balance.pending)}</span>
        </p>
        <p className="flex items-center justify-between text-kampmax-text-secondary">
          <span>Total earned</span>
          <span className="font-medium text-kampmax-text">
            {formatNaira(totalEarnedCard?.value ?? 0)}
          </span>
        </p>
      </div>

      {eligibility && !eligibility.canRequest ? (
        <p className="mt-3 rounded-md bg-kampmax-muted px-2.5 py-1.5 text-xs text-kampmax-text-secondary">
          {eligibility.reason}
        </p>
      ) : (
        <p className="mt-3 rounded-md bg-success-50 px-2.5 py-1.5 text-xs font-medium text-kampmax-success">
          You can withdraw funds now
        </p>
      )}
    </Link>
  );
}
