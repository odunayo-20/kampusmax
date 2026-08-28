"use client";

import { CheckCircle2 } from "lucide-react";
import {
  CheckoutCustomer,
  VendorDeliverySelection,
  CHECKOUT_DELIVERY_METHOD_LABELS,
} from "@/types/checkout";
import type { SavedAddress } from "@/types";
import { formatNaira } from "@/lib/utils";

interface OrderReviewProps {
  customer: CheckoutCustomer;
  campusName: string;
  address: SavedAddress | null;
  vendorDeliveries: VendorDeliverySelection[];
  vendorNames: Record<string, string>;
}

export function OrderReview({
  customer,
  campusName,
  address,
  vendorDeliveries,
  vendorNames,
}: OrderReviewProps) {
  return (
    <section
      aria-labelledby="order-review-title"
      className="bg-kampmax-muted/40 rounded-xl border border-kampmax-border p-4 sm:p-5 space-y-4"
    >
      <h2
        id="order-review-title"
        className="text-sm font-semibold text-kampmax-text flex items-center gap-2"
      >
        <CheckCircle2 className="h-4 w-4 text-kampmax-success" />
        Review before you pay
      </h2>

      <div className="space-y-4 text-sm">
        <div>
          <p className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wide mb-1">
            Contact
          </p>
          <p className="text-kampmax-text">
            {customer.fullName || "—"}
            <span className="block text-xs text-kampmax-text-secondary">
              {customer.email || ""} · {customer.phone || ""}
            </span>
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wide mb-1">
            Campus
          </p>
          <p className="text-kampmax-text">{campusName || "—"}</p>
        </div>

        {address ? (
          <div>
            <p className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wide mb-1">
              Delivery address
            </p>
            <p className="text-kampmax-text">{address.label}</p>
            <p className="text-xs text-kampmax-text-secondary">{address.address}</p>
            <p className="text-xs text-kampmax-text-secondary">
              {address.contactName} · {address.contactPhone}
            </p>
          </div>
        ) : (
          <p className="text-kampmax-warning text-xs">
            No delivery address selected yet.
          </p>
        )}

        <div>
          <p className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wide mb-1">
            Delivery method per vendor
          </p>
          {vendorDeliveries.length === 0 ? (
            <p className="text-kampmax-warning text-xs">
              Select a delivery method for each vendor.
            </p>
          ) : (
            <ul className="space-y-1">
              {vendorDeliveries.map((d) => (
                <li key={d.vendorId} className="flex justify-between gap-2 text-xs">
                  <span className="text-kampmax-text-secondary truncate">
                    {vendorNames[d.vendorId] || d.vendorId}
                  </span>
                  <span className="text-kampmax-text font-medium shrink-0">
                    {CHECKOUT_DELIVERY_METHOD_LABELS[d.method] || "Delivery"}
                    {d.fee !== undefined && d.fee > 0
                      ? ` · ${formatNaira(d.fee)}`
                      : d.fee === 0
                        ? " · Free"
                        : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
