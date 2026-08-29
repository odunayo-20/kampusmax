"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { fulfillmentStatusLabel } from "./orders-meta";
import type {
  VendorFulfillmentStatus,
  VendorPaymentStatus,
  VendorDeliveryMethod,
  VendorOrderCounts,
} from "@/types/vendor-orders";
import {
  PAYMENT_LABELS,
  paymentStatusLabel,
  DELIVERY_METHOD_LABELS,
} from "./orders-meta";

interface OrdersFiltersProps {
  fulfillmentStatus: VendorFulfillmentStatus | "all";
  onFulfillmentChange: (value: VendorFulfillmentStatus | "all") => void;
  paymentStatus: VendorPaymentStatus | "all";
  onPaymentChange: (value: VendorPaymentStatus | "all") => void;
  deliveryMethod: VendorDeliveryMethod | "all";
  onDeliveryChange: (value: VendorDeliveryMethod | "all") => void;
  issues: "all" | "with_issues";
  onIssuesChange: (value: "all" | "with_issues") => void;
  counts: VendorOrderCounts;
}

const FULFILLMENT_TABS: { value: VendorFulfillmentStatus; dot: string }[] = [
  { value: "pending", dot: "bg-kampmax-warning" },
  { value: "accepted", dot: "bg-kampmax-info" },
  { value: "processing", dot: "bg-kampmax-info" },
  { value: "ready_for_pickup", dot: "bg-kampmax-gold" },
  { value: "shipped", dot: "bg-kampmax-blue" },
  { value: "out_for_delivery", dot: "bg-kampmax-blue" },
  { value: "delivered", dot: "bg-kampmax-success" },
  { value: "completed", dot: "bg-kampmax-text-secondary/50" },
  { value: "cancelled", dot: "bg-kampmax-error" },
];

function countFor(
  counts: VendorOrderCounts,
  value: VendorFulfillmentStatus
): number {
  switch (value) {
    case "pending": return counts.pending;
    case "accepted": return counts.accepted;
    case "processing": return counts.processing;
    case "ready_for_pickup": return counts.readyForPickup;
    case "shipped": return counts.shipped;
    case "out_for_delivery": return counts.outForDelivery;
    case "delivered": return counts.delivered;
    case "completed": return counts.completed;
    case "cancelled": return counts.cancelled;
  }
}

function Tab({
  active,
  label,
  count,
  dotClass,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  dotClass?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-kampmax-navy text-white"
          : "text-kampmax-text-secondary hover:bg-kampmax-muted hover:text-kampmax-text"
      )}
    >
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", dotClass ?? "bg-kampmax-blue")} />
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
          active ? "bg-white/20 text-white" : "bg-kampmax-muted text-kampmax-text-secondary"
        )}
      >
        {count.toLocaleString("en-NG")}
      </span>
    </button>
  );
}

export function OrdersFilters({
  fulfillmentStatus,
  onFulfillmentChange,
  paymentStatus,
  onPaymentChange,
  deliveryMethod,
  onDeliveryChange,
  issues,
  onIssuesChange,
  counts,
}: OrdersFiltersProps) {
  const hasActiveFilters =
    fulfillmentStatus !== "all" ||
    paymentStatus !== "all" ||
    deliveryMethod !== "all" ||
    issues !== "all";

  return (
    <div className="rounded-lg border border-kampmax-border bg-white mb-4">
      <div
        role="tablist"
        aria-label="Filter orders by fulfillment status"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        <Tab
          active={fulfillmentStatus === "all"}
          count={counts.all}
          label="All"
          onClick={() => onFulfillmentChange("all")}
        />
        {FULFILLMENT_TABS.map((t) => (
          <Tab
            key={t.value}
            active={fulfillmentStatus === t.value}
            count={countFor(counts, t.value)}
            label={fulfillmentStatusLabel(t.value)}
            dotClass={t.dot}
            onClick={() => onFulfillmentChange(t.value)}
          />
        ))}
      </div>

      {/* Search + facet selects */}
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="w-full sm:max-w-[190px]">
          <label htmlFor="vendor-orders-pay-filter" className="sr-only">
            Filter by payment status
          </label>
          <select
            id="vendor-orders-pay-filter"
            aria-label="Filter by payment status"
            value={paymentStatus}
            onChange={(e) => onPaymentChange(e.target.value as VendorPaymentStatus | "all")}
            className="h-9 w-full rounded-lg border border-kampmax-border bg-white px-2.5 text-sm text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
          >
            <option value="all">Any payment status</option>
            {Object.keys(PAYMENT_LABELS).map((key) => (
              <option key={key} value={key}>
                {paymentStatusLabel(key as VendorPaymentStatus)}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:max-w-[160px]">
          <label htmlFor="vendor-orders-method-filter" className="sr-only">
            Filter by delivery method
          </label>
          <select
            id="vendor-orders-method-filter"
            aria-label="Filter by delivery method"
            value={deliveryMethod}
            onChange={(e) => onDeliveryChange(e.target.value as VendorDeliveryMethod | "all")}
            className="h-9 w-full rounded-lg border border-kampmax-border bg-white px-2.5 text-sm text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
          >
            <option value="all">Any fulfilment method</option>
            {(Object.keys(DELIVERY_METHOD_LABELS) as VendorDeliveryMethod[]).map((key) => (
              <option key={key} value={key}>
                {DELIVERY_METHOD_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          role="checkbox"
          aria-checked={issues === "with_issues"}
          onClick={() => onIssuesChange(issues === "all" ? "with_issues" : "all")}
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors",
            issues === "with_issues"
              ? "border-kampmax-error/30 bg-kampmax-error/5 text-kampmax-error"
              : "border-kampmax-border bg-white text-kampmax-text-secondary"
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          Issues only ({counts.withIssues})
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              onFulfillmentChange("all");
              onPaymentChange("all");
              onDeliveryChange("all");
              onIssuesChange("all");
            }}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-kampmax-blue transition-colors hover:bg-kampmax-blue/5"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}