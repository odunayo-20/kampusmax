"use client";

import { cn, formatNaira, formatDate } from "@/lib/utils";
import { WalletTransaction } from "@/types";
import { ChevronRight } from "lucide-react";
import { txConfig, statusConfig } from "./transactionConfig";

interface TransactionItemProps {
  transaction: WalletTransaction;
  onClick?: () => void;
  compact?: boolean;
}

export function TransactionItem({ transaction, onClick, compact }: TransactionItemProps) {
  const config = txConfig[transaction.type] || txConfig.payment;
  const status = statusConfig[transaction.status] || statusConfig.completed;
  const Icon = config.icon;
  const isCredit = transaction.direction === "credit";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 text-left group transition-colors",
        compact ? "px-3 py-2.5" : "px-4 py-3.5",
        "hover:bg-kampmax-muted/30"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          config.bg
        )}
      >
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-kampmax-text truncate">
            {transaction.description}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-kampmax-text-secondary">
            {formatDate(transaction.createdAt)}
          </span>
          <span className="text-[10px] text-kampmax-text-secondary/40">·</span>
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
              status.color
            )}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Amount + chevron */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={cn(
            "text-sm font-bold",
            isCredit ? "text-kampmax-success" : "text-kampmax-text"
          )}
        >
          {isCredit ? "+" : "-"}
          {formatNaira(transaction.amount)}
        </span>
        <ChevronRight className="h-4 w-4 text-kampmax-text-secondary/30 group-hover:text-kampmax-text-secondary/60 transition-colors" />
      </div>
    </button>
  );
}
