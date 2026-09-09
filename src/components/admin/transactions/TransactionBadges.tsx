"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import type {
  ManagedTransactionMethod,
  ManagedTransactionStatus,
  ManagedTransactionType,
} from "@/types/admin";
import {
  transactionMethodLabel,
  transactionStatusLabel,
  transactionStatusVariant,
  transactionTypeLabel,
  transactionTypeVariant,
} from "./transactions-meta";

export function TransactionStatusBadge({
  status,
  className,
}: {
  status: ManagedTransactionStatus;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={transactionStatusVariant(status)}
      label={transactionStatusLabel(status)}
      className={className}
    />
  );
}

export function TransactionTypeBadge({
  type,
  className,
}: {
  type: ManagedTransactionType;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={transactionTypeVariant(type)}
      label={transactionTypeLabel(type)}
      className={className}
    />
  );
}

export function TransactionMethodBadge({
  method,
  className,
}: {
  method: ManagedTransactionMethod;
  className?: string;
}) {
  return (
    <StatusBadge
      variant="neutral"
      label={`${transactionMethodLabel(method)} · ${method}`}
      dot={false}
      className={className}
    />
  );
}