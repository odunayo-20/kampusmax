"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPayoutById } from "@/services/freelancer-financials";
import { FlFinancialSubnav } from "@/components/freelancer/financials/FlFinancialSubnav";
import { FlPayoutDetail } from "@/components/freelancer/financials/FlPayoutDetail";
import { FlFinancialErrorState } from "@/components/freelancer/financials/FlFinancialEmptyState";

// Withdrawal detail (spec §29). Shows the immutable payout record with its event
// timeline. Account numbers remain masked and references are copyable.

export default function FreelancerPayoutDetailPage() {
  const params = useParams<{ id: string }>();
  const payout = getPayoutById(params.id);

  return (
    <div className="space-y-6">
      <Link
        href="/freelancer/payouts"
        className="inline-flex items-center gap-1 text-sm font-medium text-kampmax-text-secondary hover:text-kampmax-text"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to withdrawals
      </Link>

      <FlFinancialSubnav />

      {!payout ? (
        <FlFinancialErrorState
          message="This withdrawal could not be found."
          onRetry={() => window.location.reload()}
        />
      ) : (
        <FlPayoutDetail payout={payout} />
      )}
    </div>
  );
}
