"use client";

import { Award, TrendingUp, CreditCard, Hourglass } from "lucide-react";
import type { RewardsAccount } from "@/types/account";
import { tierLabel } from "@/data/account";

interface RewardsOverviewProps {
  rewards: RewardsAccount;
}

const TIER_BADGE: Record<string, string> = {
  bronze: "bg-orange-100 text-orange-700",
  silver: "bg-neutral-200 text-neutral-700",
  gold: "bg-kampmax-gold/20 text-kampmax-gold",
  platinum: "bg-indigo-100 text-indigo-700",
};

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  earned: { label: "Earned", className: "bg-success-50 text-success-700" },
  used: { label: "Used", className: "bg-error-50 text-error-700" },
  pending: { label: "Pending", className: "bg-neutral-100 text-neutral-600" },
};

/** Rewards / loyalty overview with tier, points and reward history. */
export function RewardsOverview({ rewards }: RewardsOverviewProps) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-kampmax-border p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-kampmax-text-secondary">My points</p>
            <p className="text-3xl font-bold text-kampmax-text tabular-nums">
              {rewards.points.toLocaleString()}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              TIER_BADGE[rewards.tier] || "bg-neutral-100 text-neutral-600"
            }`}
          >
            <Award className="h-3.5 w-3.5 mr-1.5" />
            {tierLabel(rewards.tier)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-kampmax-muted rounded-lg p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-success-600" />
            <p className="text-lg font-bold text-kampmax-text tabular-nums">
              {rewards.earned.toLocaleString()}
            </p>
            <p className="text-[11px] text-kampmax-text-secondary">Earned</p>
          </div>
          <div className="bg-kampmax-muted rounded-lg p-3 text-center">
            <CreditCard className="h-4 w-4 mx-auto mb-1 text-kampmax-blue" />
            <p className="text-lg font-bold text-kampmax-text tabular-nums">
              {rewards.used.toLocaleString()}
            </p>
            <p className="text-[11px] text-kampmax-text-secondary">Used</p>
          </div>
          <div className="bg-kampmax-muted rounded-lg p-3 text-center">
            <Hourglass className="h-4 w-4 mx-auto mb-1 text-kampmax-gold" />
            <p className="text-lg font-bold text-kampmax-text tabular-nums">
              {rewards.pending.toLocaleString()}
            </p>
            <p className="text-[11px] text-kampmax-text-secondary">Pending</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-kampmax-border">
        <div className="px-5 pt-4">
          <h2 className="text-sm font-semibold text-kampmax-text">
            Reward activity
          </h2>
          <p className="text-xs text-kampmax-text-secondary mt-0.5">
            Display only — points are tracked by the backend.
          </p>
        </div>
        {rewards.history.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-kampmax-text-secondary">
            No reward activity yet.
          </p>
        ) : (
          <ul className="divide-y divide-kampmax-border mt-2">
            {rewards.history.map((h) => {
              const meta = TYPE_BADGE[h.type];
              return (
                <li
                  key={h.id}
                  className="px-5 py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-kampmax-text truncate">
                      {h.description}
                    </p>
                    <p className="text-xs text-kampmax-text-secondary">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.className}`}
                    >
                      {meta.label}
                    </span>
                    <span className="text-sm font-semibold text-kampmax-text tabular-nums">
                      {h.type === "used" ? "-" : "+"}
                      {h.points}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
