"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import type {
  ManagedPayoutMethod,
  ManagedPayoutRecipientType,
  ManagedPayoutStatus,
} from "@/types/admin";
import {
  payoutMethodLabel,
  payoutRecipientLabel,
  payoutStatusLabel,
  payoutStatusVariant,
} from "./payouts-meta";

export function PayoutStatusBadge({
  status,
  className,
}: {
  status: ManagedPayoutStatus;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={payoutStatusVariant(status)}
      label={payoutStatusLabel(status)}
      className={className}
    />
  );
}

export function PayoutMethodBadge({
  method,
  className,
}: {
  method: ManagedPayoutMethod;
  className?: string;
}) {
  return (
    <StatusBadge
      variant="neutral"
      label={`${payoutMethodLabel(method)} · ${method}`}
      dot={false}
      className={className}
    />
  );
}

export function PayoutRecipientBadge({
  type,
  className,
}: {
  type: ManagedPayoutRecipientType;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={type === "vendor" ? "blue" : "info"}
      label={payoutRecipientLabel(type)}
      className={className}
    />
  );
}