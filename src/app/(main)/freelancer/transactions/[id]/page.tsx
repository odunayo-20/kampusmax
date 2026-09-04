"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTransactionById } from "@/services/freelancer-financials";
import { FlFinancialSubnav } from "@/components/freelancer/financials/FlFinancialSubnav";
import { FlTransactionDetail } from "@/components/freelancer/financials/FlTransactionDetail";
import { FlFinancialErrorState } from "@/components/freelancer/financials/FlFinancialEmptyState";

// Transaction detail (spec §16, §17). A single immutable ledger entry is shown;
// reference numbers support copy-to-clipboard and masked bank details are used.

export default function FreelancerTransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const transaction = getTransactionById(params.id);

  return (
    <div className="space-y-6">
      <Link
        href="/freelancer/transactions"
        className="inline-flex items-center gap-1 text-sm font-medium text-kampmax-text-secondary hover:text-kampmax-text"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to transactions
      </Link>

      <FlFinancialSubnav />

      {!transaction ? (
        <FlFinancialErrorState
          message="This transaction could not be found. It may have been moved or removed."
          onRetry={() => window.location.reload()}
        />
      ) : (
        <FlTransactionDetail transaction={transaction} />
      )}
    </div>
  );
}
