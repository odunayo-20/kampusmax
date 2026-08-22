"use client";

import { cn, formatNaira, formatDateTime } from "@/lib/utils";
import { WalletTransaction } from "@/types";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { txConfig, statusConfig } from "./transactionConfig";

interface TransactionDetailProps {
  transaction: WalletTransaction;
  onClose?: () => void;
}

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
              <div className="flex items-center gap-1.5 min-w-0 justify-end">
                <span className="font-mono text-xs break-all">{transaction.reference}</span>
                <button
                  onClick={copyRef}
                  className="text-kampmax-text-secondary hover:text-kampmax-blue transition-colors"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-kampmax-success" />
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
            isCredit ? "text-kampmax-success" : "text-kampmax-text"
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
        <div className="bg-kampmax-error/5 border border-kampmax-error/20 rounded-xl p-4">
          <p className="text-xs text-kampmax-error leading-relaxed">
            This transaction failed. The amount has not been deducted from your account.
            Please try again or contact support.
          </p>
        </div>
      )}
    </div>
  );
}
