"use client";

import { CheckCircle2, Clock, AlertTriangle, XCircle, RotateCcw, MinusCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { FL_TX_STATUS_META, FL_PAYOUT_STATUS_META } from "@/config/freelancer-financials";
import type { FlFinancialTxStatus, FlPayoutStatus } from "@/types/freelancer-financials";

// Status badges always pair a label, an icon and a colour hint — never colour
// alone (spec §12 / §31 accessibility).

const ICONS = {
  check: CheckCircle2,
  clock: Clock,
  alert: AlertTriangle,
  cancel: XCircle,
  rotate: RotateCcw,
  refresh: RefreshCw,
  minus: MinusCircle,
  wallet: Clock,
} as const;

export function FlTransactionStatusBadge({
  status,
  className,
}: {
  status: FlFinancialTxStatus;
  className?: string;
}) {
  const meta = FL_TX_STATUS_META[status];
  const Icon = ICONS[meta.icon];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", className)}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {meta.label}
    </span>
  );
}

export function FlPayoutStatusBadge({
  status,
  className,
}: {
  status: FlPayoutStatus;
  className?: string;
}) {
  const meta = FL_PAYOUT_STATUS_META[status];
  const Icon = ICONS[meta.icon];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", className)}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {meta.label}
    </span>
  );
}
