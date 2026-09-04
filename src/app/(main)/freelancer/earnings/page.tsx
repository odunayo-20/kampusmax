"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  getFinancialOverview,
  getPayoutAccount,
  getPayoutEligibility,
  requestPayout,
} from "@/services/freelancer-financials";
import type { FlFinancialPeriodKey, FlPayoutRequestInput, FlPayoutRequestResult } from "@/types/freelancer-financials";
import { FL_FINANCIAL_PERIOD } from "@/types/freelancer-financials";
import { FlFinancialSubnav } from "@/components/freelancer/financials/FlFinancialSubnav";
import { FlFinancialSummaryCards } from "@/components/freelancer/financials/FlFinancialSummaryCards";
import { FlBalanceCard } from "@/components/freelancer/financials/FlBalanceCard";
import { FlEarningsPeriodBar } from "@/components/freelancer/financials/FlEarningsPeriodBar";
import { FlTransactionsTable } from "@/components/freelancer/financials/FlTransactionsTable";
import { FlPayoutMethodCard } from "@/components/freelancer/financials/FlPayoutMethodCard";
import { FlPayoutRequestModal } from "@/components/freelancer/financials/FlPayoutRequestModal";

// Earnings overview (spec §7–§10). All figures are backend-computed and rendered
// as-is; the UI never derives money. Payout eligibility and any withdrawal are
// backend-authoritative and idempotency-protected.

export default function FreelancerEarningsPage() {
  const router = useRouter();
  const [overview] = useState(() => getFinancialOverview());
  const [eligibility] = useState(() => getPayoutEligibility());
  const [account] = useState(() => getPayoutAccount());
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [activePeriod, setActivePeriod] = useState<FlFinancialPeriodKey>(FL_FINANCIAL_PERIOD.TWELVE_MONTHS);

  const handleRequestPayout = (input: FlPayoutRequestInput): FlPayoutRequestResult =>
    requestPayout(input);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-kampmax-text">Earnings</h1>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          Your earnings, balance and payouts — updated in real time by the platform.
        </p>
      </header>

      <FlFinancialSubnav />

      <FlFinancialSummaryCards cards={overview.cards} />

      <FlBalanceCard
        balance={overview.balance}
        eligibility={eligibility}
        onRequestPayout={() => setWithdrawOpen(true)}
        onViewPayoutMethod={() => router.push("/freelancer/payout-methods")}
        onRefresh={() => window.location.reload()}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FlEarningsPeriodBar
            periods={overview.periods}
            active={activePeriod}
            onSelect={(key) => setActivePeriod(key)}
          />
        </div>
        <FlPayoutMethodCard
          account={overview.account}
          canWithdraw={eligibility.canRequest}
          onRequestPayout={() => setWithdrawOpen(true)}
        />
      </div>

      <section aria-labelledby="recent-transactions-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="recent-transactions-heading" className="text-lg font-semibold text-kampmax-text">
            Recent transactions
          </h2>
          <Link href="/freelancer/transactions" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <FlTransactionsTable transactions={overview.recentTransactions} />
      </section>

      <FlPayoutRequestModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onSubmit={handleRequestPayout}
        account={account}
        available={eligibility.available ?? overview.balance.available}
      />
    </div>
  );
}
