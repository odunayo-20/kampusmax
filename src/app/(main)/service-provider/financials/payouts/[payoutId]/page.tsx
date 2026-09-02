"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SpPayoutDetail } from "@/components/service-provider/financials/SpPayoutDetail";
import { SpFinancialsSkeleton } from "@/components/service-provider/financials/SpFinancialsSkeleton";
import { getPayoutById } from "@/services/service-provider-financials";
import type { SpPayout } from "@/types/service-provider-financials";

export default function PayoutDetailPage() {
  const params = useParams();
  const [payout, setPayout] = useState<SpPayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const payoutId = params.payoutId as string;
    setLoading(true);
    try {
      const p = getPayoutById(payoutId);
      if (mounted) {
        if (p) setPayout(p);
        else setError("Payout not found");
      }
    } catch {
      if (mounted) setError("You don't have access to this payout");
    } finally {
      if (mounted) setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [params.payoutId]);

  if (loading) return <SpFinancialsSkeleton />;
  if (error || !payout)
    return <div className="text-center py-12 text-kampmax-text-secondary">{error ?? "Not found"}</div>;

  return <SpPayoutDetail payout={payout} />;
}