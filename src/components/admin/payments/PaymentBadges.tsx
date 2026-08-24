"use client";

import { CreditCard, Landmark, Wallet } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  paymentMethodLabel,
  paymentStatusLabel,
  paymentStatusVariant,
} from "./payments-meta";
import type { ManagedPaymentMethod, ManagedPaymentStatus } from "@/types/admin";

export function PaymentTxnStatusBadge({ status }: { status: ManagedPaymentStatus }) {
  return (
    <StatusBadge variant={paymentStatusVariant(status)} label={paymentStatusLabel(status)} />
  );
}

export function MethodBadge({ method }: { method: ManagedPaymentMethod }) {
  const Icon = method === "wallet" ? Wallet : method === "paystack" ? CreditCard : Landmark;
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-kampmax-text-secondary"
      title={paymentMethodLabel(method)}
    >
      <Icon className="h-3.5 w-3.5 opacity-60" />
      {paymentMethodLabel(method)}
    </span>
  );
}
