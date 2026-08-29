"use client";

import { ArrowRight, Phone } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui";
import { formatNaira, timeAgo } from "@/lib/utils";
import type { VendorCustomer } from "@/types/vendor-customers";
import { customerSegmentLabel, customerSegmentVariant } from "./customers-meta";

interface CustomersTableProps {
  customers: VendorCustomer[];
  onView: (customer: VendorCustomer) => void;
}

export function CustomersTable({ customers, onView }: CustomersTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-kampmax-border bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-kampmax-border text-xs text-kampmax-text-secondary">
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Segment</th>
            <th className="px-4 py-3 font-medium">Orders</th>
            <th className="px-4 py-3 font-medium">Completed</th>
            <th className="px-4 py-3 font-medium">Total spent</th>
            <th className="px-4 py-3 font-medium">Last active</th>
            <th className="px-4 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-kampmax-border">
          {customers.map((customer) => (
            <tr key={customer.buyerId} className="hover:bg-kampmax-muted/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kampmax-navy text-xs font-bold text-white">
                    {customer.displayName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-kampmax-text">{customer.displayName}</p>
                    <p className="flex items-center gap-1 text-xs text-kampmax-text-secondary">
                      {customer.buyerId}
                      {customer.phone && (
                        <span className="inline-flex items-center gap-0.5">
                          · <Phone className="h-3 w-3" aria-hidden /> {customer.phone}
                        </span>
                      )}
                      {customer.campusLabel && <span>· {customer.campusLabel}</span>}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge variant={customerSegmentVariant(customer.segment)} label={customerSegmentLabel(customer.segment)} />
              </td>
              <td className="px-4 py-3 font-medium text-kampmax-text">{customer.totalOrders}</td>
              <td className="px-4 py-3 text-kampmax-text-secondary">{customer.completedOrders}</td>
              <td className="px-4 py-3 font-medium text-kampmax-text">{formatNaira(customer.totalSpent)}</td>
              <td className="px-4 py-3 text-kampmax-text-secondary" title={customer.lastOrderAt}>
                {timeAgo(customer.lastInteractionAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <Button variant="outline" size="sm" onClick={() => onView(customer)} aria-label={`View ${customer.displayName}`}>
                  View
                  <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}