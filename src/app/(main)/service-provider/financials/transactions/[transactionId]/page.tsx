"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SpTransactionDetail } from "@/components/service-provider/financials/SpTransactionDetail";
import { SpFinancialsSkeleton } from "@/components/service-provider/financials/SpFinancialsSkeleton";
import { getTransactionById } from "@/services/service-provider-financials";
import type { SpFinancialTransaction } from "@/types/service-provider-financials";

export default function TransactionDetailPage() {
  const params = useParams();
  const [transaction, setTransaction] = useState<SpFinancialTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const transactionId = params.transactionId as string;
    setLoading(true);
    try {
      const tx = getTransactionById(transactionId);
      if (mounted) {
        if (tx) setTransaction(tx);
        else setError("Transaction not found");
      }
    } catch {
      if (mounted) setError("You don't have access to this transaction");
    } finally {
      if (mounted) setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [params.transactionId]);

  if (loading) return <SpFinancialsSkeleton />;
  if (error || !transaction)
    return <div className="text-center py-12 text-kampmax-text-secondary">{error ?? "Not found"}</div>;

  return <SpTransactionDetail transaction={transaction} />;
}