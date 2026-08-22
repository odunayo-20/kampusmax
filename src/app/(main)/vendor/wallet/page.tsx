"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { WalletStats } from "@/components/wallet/WalletStats";
import { TransactionItem } from "@/components/wallet/TransactionItem";
import { TransactionDetail } from "@/components/wallet/TransactionDetail";
import { FundingModal } from "@/components/wallet/FundingModal";
import { WithdrawModal } from "@/components/wallet/WithdrawModal";
import { useAuth } from "@/lib/auth-context";
import { getWallet, getWalletTransactions, depositToWallet, withdrawFromWallet } from "@/services/wallet";
import { WalletTransaction, WalletTransactionType } from "@/types";
import { Clock, Building2 } from "lucide-react";
import { cn, formatNaira } from "@/lib/utils";

export default function VendorWalletPage() {
  const { user } = useAuth();
  const [, setTick] = useState(0);
  const [filter, setFilter] = useState<"all" | WalletTransactionType>("all");
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);
  const [showFunding, setShowFunding] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  if (!user) return null;

  const wallet = getWallet(user.id);
  if (!wallet) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-kampmax-text">Vendor Wallet</h1>
        <div className="bg-white rounded-xl border border-kampmax-border p-8 text-center">
          <p className="text-sm font-medium text-kampmax-text">No wallet found</p>
        </div>
      </div>
    );
  }

  const txs = getWalletTransactions(wallet.id);
  const filtered = filter === "all" ? txs : txs.filter((t) => t.type === filter);

  const completedSales = txs
    .filter((t) => t.type === "vendor_payout" && t.status === "completed")
    .reduce((s, t) => s + t.amount, 0);
  const pendingPayouts = txs
    .filter((t) => t.type === "vendor_payout" && t.status === "pending")
    .reduce((s, t) => s + t.amount, 0);

  function handleFund(amt: number, method: string) {
    depositToWallet(user!.id, amt, `Top-up via ${method}`);
    setTick((t) => t + 1);
  }

  function handleWithdraw(amt: number, bank: string, account: string) {
    withdrawFromWallet(user!.id, amt, bank, account);
    setTick((t) => t + 1);
  }

  return (
    <PageContainer className="space-y-4">
      <h1 className="text-xl font-bold text-kampmax-text">Vendor Wallet</h1>

      <BalanceCard
        wallet={wallet}
        onTopUp={() => setShowFunding(true)}
        onWithdraw={() => setShowWithdraw(true)}
      />

      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-kampmax-success" />
          <span className="text-sm font-semibold text-kampmax-text">Earnings Summary</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-kampmax-success/10 rounded-lg p-3">
            <p className="text-[10px] text-kampmax-success font-medium">Received</p>
            <p className="text-sm font-bold text-kampmax-success">{formatNaira(completedSales)}</p>
          </div>
          <div className="bg-kampmax-gold/10 rounded-lg p-3">
            <p className="text-[10px] text-kampmax-gold font-medium">Pending</p>
            <p className="text-sm font-bold text-kampmax-gold">{formatNaira(pendingPayouts)}</p>
          </div>
        </div>
      </div>

      <WalletStats transactions={txs} />

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
        {(["all", "vendor_payout", "withdrawal", "deposit", "purchase", "refund"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0",
              filter === f
                ? "bg-kampmax-navy text-white"
                : "bg-white text-kampmax-text-secondary border border-kampmax-border"
            )}
          >
            {f === "all" ? "All" : f === "vendor_payout" ? "Payouts" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-kampmax-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="h-8 w-8 text-kampmax-text-secondary/30 mx-auto mb-2" />
            <p className="text-sm text-kampmax-text-secondary">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-kampmax-border">
            {filtered.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} onClick={() => setSelectedTx(tx)} />
            ))}
          </div>
        )}
      </div>

      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl max-h-[85vh] flex flex-col">
            <div className="shrink-0 bg-white border-b border-kampmax-border px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-kampmax-text">Transaction Details</h2>
              <button onClick={() => setSelectedTx(null)} className="text-sm text-kampmax-text-secondary">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <TransactionDetail transaction={selectedTx} />
            </div>
          </div>
        </div>
      )}

      <FundingModal isOpen={showFunding} onClose={() => setShowFunding(false)} onFund={handleFund} balance={wallet.balance} />
      <WithdrawModal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} onWithdraw={handleWithdraw} balance={wallet.balance} />
    </PageContainer>
  );
}
