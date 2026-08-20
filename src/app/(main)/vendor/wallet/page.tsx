"use client";

import { useState } from "react";
import {
  Wallet, ArrowUpRight, ArrowDownLeft, ArrowDownRight,
  Plus, Clock, RefreshCw, TrendingUp, X,
} from "lucide-react";
import { cn, formatNaira, formatDate } from "@/lib/utils";
import { getWalletByUser } from "@/data/wallet";
import { getCurrentUser } from "@/services/users";
import { WalletTransaction } from "@/types";

const txIcons: Record<string, { icon: typeof ArrowUpRight; color: string }> = {
  deposit: { icon: ArrowDownLeft, color: "text-green-600 bg-green-50" },
  payment: { icon: ArrowUpRight, color: "text-kampmax-error bg-red-50" },
  withdrawal: { icon: ArrowDownRight, color: "text-orange-600 bg-orange-50" },
  refund: { icon: RefreshCw, color: "text-kampmax-blue bg-blue-50" },
  transfer: { icon: ArrowUpRight, color: "text-purple-600 bg-purple-50" },
};

export default function VendorWalletPage() {
  const user = getCurrentUser();
  const wallet = getWalletByUser(user.id);
  const [showPayout, setShowPayout] = useState(false);

  if (!wallet) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-kampmax-text">Vendor Wallet</h1>
        <div className="bg-white rounded-xl border border-kampmax-border p-8 text-center">
          <Wallet className="h-10 w-10 text-kampmax-text-secondary mx-auto mb-3" />
          <p className="text-sm font-medium text-kampmax-text">No wallet found</p>
        </div>
      </div>
    );
  }

  const txs: WalletTransaction[] = wallet.transactions;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-kampmax-text">Vendor Wallet</h1>

      {/* Balance */}
      <div className="bg-gradient-to-br from-kampmax-navy to-kampmax-blue rounded-xl p-5 text-white">
        <p className="text-xs text-white/60 mb-1">Available Balance</p>
        <p className="text-3xl font-bold">{formatNaira(wallet.balance)}</p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowPayout(true)}
            className="flex-1 py-2.5 rounded-lg bg-white/10 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
          >
            <ArrowUpRight className="h-4 w-4" /> Withdraw
          </button>
          <button className="flex-1 py-2.5 rounded-lg bg-white/10 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
            <Plus className="h-4 w-4" /> Top Up
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-kampmax-border">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-kampmax-text">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-kampmax-border">
          {txs.length === 0 ? (
            <div className="p-6 text-center">
              <Clock className="h-8 w-8 text-kampmax-text-secondary mx-auto mb-2" />
              <p className="text-xs text-kampmax-text-secondary">No transactions yet</p>
            </div>
          ) : (
            txs.map((tx) => {
              const txConfig = txIcons[tx.type] || txIcons.payment;
              const Icon = txConfig.icon;
              const isCredit = tx.type === "deposit" || tx.type === "refund";
              return (
                <div key={tx.id} className="px-4 py-3 flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", txConfig.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-kampmax-text truncate">{tx.description}</p>
                    <p className="text-[11px] text-kampmax-text-secondary">{formatDate(tx.createdAt)}</p>
                  </div>
                  <span className={cn("text-sm font-bold flex-shrink-0", isCredit ? "text-green-600" : "text-kampmax-text")}>
                    {isCredit ? "+" : "-"}{formatNaira(tx.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Payout Modal */}
      {showPayout && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl">
            <div className="px-4 py-3 border-b border-kampmax-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-kampmax-text">Withdraw Funds</h2>
              <button onClick={() => setShowPayout(false)} className="text-kampmax-text-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-kampmax-muted/50 rounded-lg p-3">
                <p className="text-xs text-kampmax-text-secondary">Available for withdrawal</p>
                <p className="text-lg font-bold text-kampmax-text">{formatNaira(wallet.balance)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Amount (₦)</label>
                <input type="number" placeholder="Enter amount" min={100} max={wallet.balance}
                  className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
              </div>
              <div>
                <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Bank Account</label>
                <div className="px-3 py-2.5 rounded-lg border border-kampmax-border bg-kampmax-muted/30 text-sm text-kampmax-text">
                  GTBank Savings •••• 4567
                </div>
              </div>
              <p className="text-[11px] text-kampmax-text-secondary">
                Payouts are processed within 24 hours to your linked bank account.
              </p>
            </div>
            <div className="px-4 py-3 border-t border-kampmax-border">
              <button className="w-full py-3 rounded-xl bg-kampmax-blue text-white text-sm font-semibold">
                Request Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
