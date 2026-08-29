"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FinancialsHeader } from "@/components/vendor-financials/FinancialsHeader";
import { FinancialSummaryCards } from "@/components/vendor-financials/FinancialSummaryCards";
import { EscrowReadinessPanel } from "@/components/vendor-financials/EscrowReadinessPanel";
import { PayoutAccountCard } from "@/components/vendor-financials/PayoutAccountCard";
import { TransactionTable } from "@/components/vendor-financials/TransactionTable";
import { FinancialsSkeleton } from "@/components/vendor-financials/FinancialsSkeleton";
import { getFinancialOverview } from "@/services/vendor-financials";
import type { VendorFinancialOverview } from "@/types/vendor-financials";

export default function FinancialsPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<VendorFinancialOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    try {
      const data = getFinancialOverview();
      if (mounted) setOverview(data);
    } catch (e) {
      if (mounted) setError("You don't have access to financials");
    } finally {
      if (mounted) setLoading(false);
    }
    return () => { mounted = false; };
  }, []);

  if (loading) return <FinancialsSkeleton />;
  if (error || !overview) return <div className="text-center py-12 text-kampmax-text-secondary">{error ?? "No access"}</div>;

  return (
    <div className="space-y-6">
      <FinancialsHeader overview={overview} onExportStatement={() => router.push("/vendor/financials/statements")} />

      <FinancialSummaryCards cards={overview.cards} />

      <EscrowReadinessPanel data={overview.escrow} />

      <PayoutAccountCard
        account={overview.account}
        onRequestPayout={() => router.push("/vendor/financials/payouts")}
        canRequest={overview.account.status === "verified"}
      />

      <section aria-labelledby="recent-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="recent-heading" className="text-lg font-semibold text-kampmax-text">
            Recent transactions
          </h2>
          <a
            href="/vendor/financials/transactions"
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            View all
          </a>
        </div>
        <TransactionTable items={overview.recentTransactions} compact onRowClick={(tx) => router.push(`/vendor/financials/${tx.id}`)} />
      </section>
    </div>
  );
}