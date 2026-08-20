"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Wallet, ArrowUpRight, ArrowDownLeft, ArrowDownRight,
  Plus, TrendingUp, Clock, CreditCard, Building2, RefreshCw, X,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsGroup, SettingsRow } from "@/components/profile/SettingsGroup";
import { getCurrentUser } from "@/services/users";
import { getWalletByUser } from "@/data/wallet";
import { formatNaira, formatDate } from "@/lib/utils";
import { WalletTransaction } from "@/types";

const txIcons: Record<string, { icon: typeof ArrowUpRight; color: string }> = {
  deposit: { icon: ArrowDownLeft, color: "text-green-600 bg-green-50" },
  payment: { icon: ArrowUpRight, color: "text-kampmax-error bg-red-50" },
  withdrawal: { icon: ArrowDownRight, color: "text-orange-600 bg-orange-50" },
  refund: { icon: RefreshCw, color: "text-kampmax-blue bg-blue-50" },
  transfer: { icon: ArrowUpRight, color: "text-purple-600 bg-purple-50" },
};

export default function WalletPage() {
  const router = useRouter();
  const user = getCurrentUser();
  const wallet = getWalletByUser(user.id);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [filter, setFilter] = useState<"all" | "deposit" | "payment" | "withdrawal">("all");

  if (!wallet) {
    return (
      <PageContainer className="space-y-4">
        <Breadcrumbs items={[{ label: "Profile", href: "/profile" }, { label: "Wallet" }]} />
        <div className="bg-white rounded-xl border border-kampmax-border p-8 text-center">
          <Wallet className="h-10 w-10 text-kampmax-text-secondary mx-auto mb-3" />
          <p className="text-sm font-medium text-kampmax-text">No wallet found</p>
          <p className="text-xs text-kampmax-text-secondary mt-1">Contact support to set up your wallet</p>
        </div>
      </PageContainer>
    );
  }

  const txs: WalletTransaction[] = wallet.transactions;
  const filtered = filter === "all" ? txs : txs.filter((t) => t.type === filter);

  const quickAmounts = [1000, 2000, 5000, 10000];

  return (
    <PageContainer className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Profile", href: "/profile" },
          { label: "Wallet" },
        ]}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <h1 className="text-lg font-bold text-kampmax-text">Kampmax Wallet</h1>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-kampmax-navy to-kampmax-blue rounded-xl p-5 text-white">
        <p className="text-xs text-white/60 mb-1">Available Balance</p>
        <p className="text-3xl font-bold">{formatNaira(wallet.balance)}</p>
        <p className="text-xs text-white/60 mt-2">
          {wallet.currency} &middot; Active since {new Date(wallet.createdAt).toLocaleDateString("en-NG", { month: "short", year: "numeric" })}
        </p>
        <button
          onClick={() => setShowTopUp(true)}
          className="mt-4 w-full py-2.5 rounded-lg bg-white/10 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
        >
          <Plus className="h-4 w-4" /> Top Up Wallet
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl border border-kampmax-border p-3 text-center">
          <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
          <p className="text-sm font-bold text-kampmax-text">
            {formatNaira(txs.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0))}
          </p>
          <p className="text-[10px] text-kampmax-text-secondary">Total In</p>
        </div>
        <div className="bg-white rounded-xl border border-kampmax-border p-3 text-center">
          <ArrowUpRight className="h-4 w-4 text-kampmax-error mx-auto mb-1" />
          <p className="text-sm font-bold text-kampmax-text">
            {formatNaira(txs.filter((t) => t.type === "payment").reduce((s, t) => s + t.amount, 0))}
          </p>
          <p className="text-[10px] text-kampmax-text-secondary">Spent</p>
        </div>
        <div className="bg-white rounded-xl border border-kampmax-border p-3 text-center">
          <ArrowDownRight className="h-4 w-4 text-orange-600 mx-auto mb-1" />
          <p className="text-sm font-bold text-kampmax-text">
            {formatNaira(txs.filter((t) => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0))}
          </p>
          <p className="text-[10px] text-kampmax-text-secondary">Withdrawn</p>
        </div>
      </div>

      {/* Transaction Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "deposit", "payment", "withdrawal"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? "bg-kampmax-navy text-white"
                : "bg-white text-kampmax-text-secondary border border-kampmax-border"
            }`}
          >
            {f === "all" ? "All" : f === "deposit" ? "Deposits" : f === "payment" ? "Payments" : "Withdrawals"}
          </button>
        ))}
      </div>

      {/* Transactions */}
      <SettingsGroup title="Transactions" description={`${filtered.length} transactions`}>
        {filtered.length === 0 ? (
          <div className="p-6 text-center">
            <Clock className="h-8 w-8 text-kampmax-text-secondary mx-auto mb-2" />
            <p className="text-xs text-kampmax-text-secondary">No transactions yet</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const txConfig = txIcons[tx.type] || txIcons.payment;
            const Icon = txConfig.icon;
            const isCredit = tx.type === "deposit" || tx.type === "refund";
            return (
              <div key={tx.id} className="px-4 py-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${txConfig.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-kampmax-text truncate">
                    {tx.description}
                  </p>
                  <p className="text-[11px] text-kampmax-text-secondary">
                    {formatDate(tx.createdAt)} &middot; {tx.status}
                  </p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${isCredit ? "text-green-600" : "text-kampmax-text"}`}>
                  {isCredit ? "+" : "-"}{formatNaira(tx.amount)}
                </span>
              </div>
            );
          })
        )}
      </SettingsGroup>

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl">
            <div className="sticky top-0 bg-white border-b border-kampmax-border px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-kampmax-text">Top Up Wallet</h2>
              <button
                onClick={() => setShowTopUp(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-kampmax-text-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                  min={100}
                  className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
                />
              </div>
              <div>
                <p className="text-xs text-kampmax-text-secondary mb-2">Quick amounts</p>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTopUpAmount(String(amt))}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                        topUpAmount === String(amt)
                          ? "bg-kampmax-blue text-white border-kampmax-blue"
                          : "bg-white text-kampmax-text border-kampmax-border"
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-kampmax-muted/50 rounded-lg p-3">
                <p className="text-xs text-kampmax-text-secondary leading-relaxed">
                  Top up via Paystack (card, bank transfer, USSD). Minimum top-up: ₦100.
                </p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-kampmax-border px-4 py-3">
              <button
                disabled={!topUpAmount || Number(topUpAmount) < 100}
                className="w-full py-3 rounded-xl bg-kampmax-blue text-white text-sm font-semibold disabled:opacity-40"
              >
                Top Up ₦{topUpAmount ? Number(topUpAmount).toLocaleString() : "0"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
