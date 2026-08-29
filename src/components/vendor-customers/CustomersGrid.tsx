"use client";

import { ChevronRight, Phone } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatNaira, timeAgo } from "@/lib/utils";
import type { VendorCustomer } from "@/types/vendor-customers";
import { customerSegmentLabel, customerSegmentVariant } from "./customers-meta";

interface CustomersGridProps {
  customers: VendorCustomer[];
  onView: (customer: VendorCustomer) => void;
}

export function CustomersGrid({ customers, onView }: CustomersGridProps) {
  return (
    <div className="space-y-2">
      {customers.map((customer) => (
        <button
          key={customer.buyerId}
          type="button"
          onClick={() => onView(customer)}
          className="w-full rounded-xl border border-kampmax-border bg-white p-4 text-left transition-colors hover:bg-kampmax-muted/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-kampmax-navy text-sm font-bold text-white">
              {customer.displayName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-kampmax-text">{customer.displayName}</p>
              <p className="text-xs text-kampmax-text-secondary">
                {customer.buyerId}
                {customer.campusLabel && ` · ${customer.campusLabel}`}
              </p>
            </div>
            <StatusBadge variant={customerSegmentVariant(customer.segment)} label={customerSegmentLabel(customer.segment)} />
            <ChevronRight className="h-4 w-4 text-kampmax-text-secondary" aria-hidden />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <Stat label="Orders" value={String(customer.totalOrders)} />
            <Stat label="Total spent" value={formatNaira(customer.totalSpent)} />
            <Stat label="Last active" value={timeAgo(customer.lastInteractionAt)} />
          </div>

          {customer.phone && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-kampmax-text-secondary">
              <Phone className="h-3 w-3" aria-hidden />
              {customer.phone}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-kampmax-muted/50 px-2 py-2 text-center">
      <p className="truncate text-sm font-bold text-kampmax-text">{value}</p>
      <p className="text-[10px] text-kampmax-text-secondary">{label}</p>
    </div>
  );
}