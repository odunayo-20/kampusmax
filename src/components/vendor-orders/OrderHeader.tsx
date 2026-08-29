"use client";

import { ShoppingCart, PackageCheck, CreditCard, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VendorOrderCounts } from "@/types/vendor-orders";

interface OrderHeaderProps {
  counts: VendorOrderCounts;
  onViewAll: () => void;
}

function Metric({
  icon,
  label,
  value,
  sub,
  iconClass,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-4 flex flex-col gap-1">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconClass)}>
        {icon}
      </div>
      <p className={cn("mt-2 text-lg font-bold tabular-nums text-kampmax-text", valueClass)}>{value}</p>
      <p className="text-xs font-medium text-kampmax-text-secondary">{label}</p>
      {sub && <p className="text-[11px] text-kampmax-text-secondary/80">{sub}</p>}
    </div>
  );
}

export function OrderHeader({ counts, onViewAll }: OrderHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-kampmax-text">Orders</h1>
          <p className="text-sm text-kampmax-text-secondary">
            {counts.all} order{counts.all !== 1 ? "s" : ""} · {counts.paymentPending} payment pending
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-kampmax-blue hover:underline"
        >
          View all
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          icon={<ShoppingCart className="h-4 w-4 text-kampmax-blue" aria-hidden />}
          iconClass="bg-kampmax-blue/10"
          label="All orders"
          value={counts.all.toLocaleString("en-NG")}
        />
        <Metric
          icon={<PackageCheck className="h-4 w-4 text-kampmax-gold-dark" aria-hidden />}
          iconClass="bg-kampmax-gold/15"
          label="Needs action"
          value={counts.needsAction.toLocaleString("en-NG")}
          sub="pending, accepted, processing"
        />
        <Metric
          icon={<CreditCard className="h-4 w-4 text-kampmax-warning" aria-hidden />}
          iconClass="bg-kampmax-warning/10"
          label="Payment processing"
          value={counts.paymentPending.toLocaleString("en-NG")}
        />
        <Metric
          icon={<AlertTriangle className="h-4 w-4 text-kampmax-error" aria-hidden />}
          iconClass="bg-kampmax-error/10"
          label="Open issues"
          value={counts.withIssues.toLocaleString("en-NG")}
        />
      </div>
    </div>
  );
}