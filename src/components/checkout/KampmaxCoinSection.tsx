"use client";

import { Coins, Info } from "lucide-react";
import { KampmaxCoinState } from "@/types/checkout";
import { formatNaira } from "@/lib/utils";

interface KampmaxCoinSectionProps {
  coin: KampmaxCoinState;
  onToggle: (use: boolean) => void;
  onLoad?: () => void;
}

export function KampmaxCoinSection({
  coin,
  onToggle,
  onLoad,
}: KampmaxCoinSectionProps) {
  // If the backend hasn't enabled coins, hide the feature gracefully.
  if (!coin.enabledByBackend) return null;

  void onLoad;

  return (
    <section className="bg-white rounded-xl border border-kampmax-border p-4 sm:p-5 space-y-3">
      <h2 className="text-sm font-semibold text-kampmax-text flex items-center gap-2">
        <Coins className="h-4 w-4 text-kampmax-gold" />
        Kampmax Coin
      </h2>

      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="text-sm text-kampmax-text">
          Use Kampmax Coin
          <span className="block text-xs text-kampmax-text-secondary">
            Balance: {coin.balance.toLocaleString()} KMC
          </span>
        </span>
        <button
          role="switch"
          aria-checked={coin.useCoin}
          onClick={() => onToggle(!coin.useCoin)}
          className={
            "relative h-6 w-11 rounded-full transition-colors " +
            (coin.useCoin ? "bg-kampmax-blue" : "bg-neutral-300")
          }
        >
          <span
            className={
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform " +
              (coin.useCoin ? "translate-x-[22px]" : "translate-x-0.5")
            }
          />
        </button>
      </label>

      {coin.useCoin && (
        <div className="flex items-start gap-2 p-2.5 bg-kampmax-gold/10 rounded-lg">
          <Info className="w-3.5 h-3.5 text-kampmax-warning shrink-0 mt-0.5" />
          <p className="text-[11px] text-kampmax-text-secondary leading-relaxed">
            Applied: {formatNaira(coin.appliedAmount)}. Balance, conversion
            rate and eligibility are confirmed by the server before payment.
          </p>
        </div>
      )}
    </section>
  );
}
