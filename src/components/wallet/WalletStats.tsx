"use client";

import { cn, formatNaira } from "@/lib/utils";
import { WalletTransaction } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from "lucide-react";

interface WalletStatsProps {
  transactions: WalletTransaction[];
}

export function WalletStats({ transactions }: WalletStatsProps) {
  const completed = transactions.filter((t) => t.status === "completed");
  const totalIn = completed
    .filter((t) => t.direction === "credit")
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = completed
    .filter((t) => t.direction === "debit")
    .reduce((s, t) => s + t.amount, 0);
  const pendingCount = transactions.filter(
    (t) => t.status === "pending" || t.status === "processing"
  ).length;
  const refunds = completed
    .filter((t) => t.type === "refund")
    .reduce((s, t) => s + t.amount, 0);

  const stats = [
    {
      icon: ArrowDownLeft,
      label: "Money In",
      value: totalIn,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: ArrowUpRight,
      label: "Money Out",
      value: totalOut,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      icon: Clock,
      label: "Pending",
      value: pendingCount,
      color: "text-kampmax-gold",
      bg: "bg-kampmax-gold/10",
      isCount: true,
    },
    {
      icon: RefreshCw,
      label: "Refunds",
      value: refunds,
      color: "text-kampmax-blue",
      bg: "bg-kampmax-blue/10",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-kampmax-border p-3 text-center"
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5",
                stat.bg
              )}
            >
              <Icon className={cn("h-4 w-4", stat.color)} />
            </div>
            <p className="text-xs font-bold text-kampmax-text">
              {stat.isCount ? stat.value : formatNaira(stat.value)}
            </p>
            <p className="text-[10px] text-kampmax-text-secondary mt-0.5">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
