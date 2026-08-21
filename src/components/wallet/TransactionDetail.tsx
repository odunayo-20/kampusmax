"use client";

import { cn, formatNaira, formatDateTime } from "@/lib/utils";
import { WalletTransaction } from "@/types";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Gift,
  ShoppingCart,
  Building2,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

interface TransactionDetailProps {
  transaction: WalletTransaction;
  onClose?: () => void;
}

const txConfig: Record<
  string,
  { icon: typeof ArrowUpRight; bg: string; color: string; label: string }
> = {
  deposit: {
    icon: ArrowDownLeft,
    bg: "bg-green-50",
    color: "text-green-600",
    label: "Deposit",
  },
  purchase: {
    icon: ShoppingCart,
    bg: "bg-purple-50",
    color: "text-purple-600",
    label: "Purchase",
  },
  payment: {
    icon: ShoppingCart,
    bg: "bg-purple-50",
    color: "text-purple-600",
    label: "Payment",
  },
  refund: {
    icon: RefreshCw,
    bg: "bg-kampmax-blue/10",
    color: "text-kampmax-blue",
    label: "Refund",
  },
  withdrawal: {
    icon: ArrowDownRight,
    bg: "bg-orange-50",
    color: "text-orange-600",
    label: "Withdrawal",
  },
  vendor_payout: {
    icon: Building2,
    bg: "bg-emerald-50",
    color: "text-emerald-600",
    label: "Vendor Payout",
  },
  loyalty_reward: {
    icon: Gift,
    bg: "bg-kampmax-gold/10",
    color: "text-kampmax-gold",
    label: "Loyalty Reward",
  },
  transfer: {
    icon: ArrowUpRight,
    bg: "bg-slate-100",
    color: "text-slate-600",
    label: "Transfer",
  },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  completed: { label: "Completed", color: "text-green-600 bg-green-50" },
  pending: { label: "Pending", color: "text-kampmax-gold bg-kampmax-gold/10" },
  processing: { label: "Processing", color: "text-kampmax-blue bg-kampmax-blue/10" },
  failed: { label: "Failed", color: "text-red-500 bg-red-50" },
  cancelled: { label: "Cancelled", color: "text-kampmax-text-secondary bg-kampmax-muted" },
};

export function TransactionDetail({ transaction, onClose }: TransactionDetailProps) {
  const [copied, setCopied] = useState(false);
  const config = txConfig[transaction.type] || txConfig.payment;
  const status = statusConfig[transaction.status] || statusConfig.completed;
  const Icon = config.icon;
  const isCredit = transaction.direction === "credit";

  function copyRef() {
    if (transaction.reference) {
      navigator.clipboard.writeText(transaction.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const rows = [
    { label: "Type", value: config.label },
    {
      label: "Status",
      value: (
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", status.color)}>
          {status.label}
        </span>
      ),
    },
    { label: "Date", value: formatDateTime(transaction.createdAt) },
    ...(transaction.completedAt
      ? [{ label: "Completed", value: formatDateTime(transaction.completedAt) }]
      : []),
    ...(transaction.reference
      ? [
          {
            label: "Reference",
            value: (
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs">{transaction.reference}</span>
                <button
                  onClick={copyRef}
                  className="text-kampmax-text-secondary hover:text-kampmax-blue transition-colors"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            ),
          },
        ]
      : []),
    ...(transaction.orderId
      ? [{ label: "Order", value: `#${transaction.orderId}` }]
      : []),
    ...(transaction.bankName
      ? [{ label: "Bank", value: `${transaction.bankName} ${transaction.bankAccount || ""}` }]
      : []),
    ...(transaction.metadata
      ? Object.entries(transaction.metadata).map(([k, v]) => ({
          label: k.charAt(0).toUpperCase() + k.slice(1),
          value: v,
        }))
      : []),
  ];

  return (
    <div className="space-y-4">
      {/* Amount Header */}
      <div className="text-center py-4">
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3",
            config.bg
          )}
        >
          <Icon className={cn("h-8 w-8", config.color)} />
        </div>
        <p
          className={cn(
            "text-3xl font-bold",
            isCredit ? "text-green-600" : "text-kampmax-text"
          )}
        >
          {isCredit ? "+" : "-"}
          {formatNaira(transaction.amount)}
        </p>
        <p className="text-sm text-kampmax-text-secondary mt-1">
          {transaction.description}
        </p>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-kampmax-border divide-y divide-kampmax-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-kampmax-text-secondary">{row.label}</span>
            <span className="text-sm font-medium text-kampmax-text text-right">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Help text */}
      {(transaction.status === "pending" || transaction.status === "processing") && (
        <div className="bg-kampmax-blue/5 border border-kampmax-blue/20 rounded-xl p-4">
          <p className="text-xs text-kampmax-text-secondary leading-relaxed">
            This transaction is being processed. It may take a few minutes to complete.
            If it doesn't complete within 24 hours, please contact support.
          </p>
        </div>
      )}

      {transaction.status === "failed" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600 leading-relaxed">
            This transaction failed. The amount has not been deducted from your account.
            Please try again or contact support.
          </p>
        </div>
      )}
    </div>
  );
}
