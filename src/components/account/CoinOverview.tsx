"use client";

import { Coins, Clock } from "lucide-react";
import type { KampmaxCoinAccount } from "@/types/account";
import { formatNaira } from "@/lib/utils";
import { AccountEmptyState } from "./AccountEmptyState";

interface CoinOverviewProps {
  coin: KampmaxCoinAccount;
}

/**
 * Kampmax Coin overview. When the backend hasn't enabled the coin program
 * (isActive === false) we render an honest coming-soon/disabled state — we
 * never invent balances or pretend it's operational. When active, balance and
 * transaction history render as display-only values (backend authoritative).
 */
export function CoinOverview({ coin }: CoinOverviewProps) {
  if (!coin.isActive) {
    return (
      <div className="bg-white rounded-xl border border-kampmax-border overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-kampmax-gold/15 flex items-center justify-center mb-4">
            <Coins className="w-7 h-7 text-kampmax-gold" />
          </div>
          <h2 className="text-base font-bold text-kampmax-text">
            Kampmax Coin is coming soon
          </h2>
          <p className="text-sm text-kampmax-text-secondary mt-1.5 max-w-md">
            {coin.disabledReason ||
              "Kampmax Coin is not active yet. When it launches, your earnings will appear here."}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-kampmax-text-secondary bg-kampmax-muted px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            Not yet available
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-kampmax-navy to-kampmax-blue rounded-xl p-5 sm:p-6 text-white">
        <p className="text-xs text-white/70">Kampmax Coin balance</p>
        <p className="text-3xl font-bold mt-1">{coin.balance.toLocaleString()}</p>
        <p className="text-xs text-white/70 mt-1">
          ≈ {formatNaira(coin.available)} available
        </p>
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-white/70 text-xs">Pending</p>
            <p className="font-semibold">{coin.pending.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-white/70 text-xs">Lifetime earned</p>
            <p className="font-semibold">{coin.lifetimeEarned.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {coin.transactions.length === 0 ? (
        <AccountEmptyState
          icon={<Coins />}
          title="No coin activity yet"
          description="Your coin history will appear here as you earn."
        />
      ) : (
        <ul className="bg-white rounded-xl border border-kampmax-border divide-y divide-kampmax-border">
          {coin.transactions.map((t) => (
            <li key={t.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-kampmax-text truncate">
                  {t.description}
                </p>
                <p className="text-xs text-kampmax-text-secondary">
                  {new Date(t.created).toLocaleDateString()}
                </p>
              </div>
              <span
                className={
                  t.amount >= 0 ? "text-success-600 font-semibold" : "text-error-600 font-semibold"
                }
              >
                {t.amount >= 0 ? "+" : ""}
                {t.amount} KMC
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
