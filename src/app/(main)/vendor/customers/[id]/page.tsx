"use client";

import { useEffect, useMemo, useState, use } from "react";
import { UserX } from "lucide-react";
import { getVendorCustomerByBuyerId, getVendorCustomerNotes, getVendorCustomerPermissions } from "@/services/vendor-customers";
import { CustomerDetailHeader } from "@/components/vendor-customers/CustomerDetailHeader";
import { CustomerOverviewPanel } from "@/components/vendor-customers/CustomerOverviewPanel";
import { CustomerOrdersPanel } from "@/components/vendor-customers/CustomerOrdersPanel";
import { CustomerActivityPanel } from "@/components/vendor-customers/CustomerActivityPanel";
import { CustomerNotesPanel } from "@/components/vendor-customers/CustomerNotesPanel";
import { CustomerDetailSkeleton } from "@/components/vendor-customers/CustomerSkeleton";
import type { VendorCustomerDetails } from "@/types/vendor-customers";

export default function VendorCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const details = useMemo<VendorCustomerDetails | null>(
    () => getVendorCustomerByBuyerId(id),
    [id, tick]
  );
  const notes = useMemo(() => (details ? getVendorCustomerNotes(id) : []), [details, id, tick]);
  const permissions = useMemo(() => getVendorCustomerPermissions(), []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <CustomerDetailSkeleton />;

  if (!details) {
    return (
      <div className="rounded-xl border border-kampmax-border bg-white p-10 text-center">
        <UserX className="mx-auto mb-3 h-10 w-10 text-kampmax-text-secondary" aria-hidden />
        <p className="text-sm font-medium text-kampmax-text">Customer not found</p>
        <p className="mt-1 text-xs text-kampmax-text-secondary">
          This customer may not have ordered from your store.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-4">
      <CustomerDetailHeader details={details} />

      <CustomerOverviewPanel details={details} />

      <CustomerOrdersPanel orders={details.orders} />

      <div className="grid gap-4 lg:grid-cols-2">
        <CustomerActivityPanel activity={details.activity} />
        <CustomerNotesPanel buyerId={id} notes={notes} canNote={permissions["customers.note"]} onChanged={() => setTick((t) => t + 1)} />
      </div>
    </div>
  );
}