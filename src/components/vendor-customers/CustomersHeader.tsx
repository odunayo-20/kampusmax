"use client";

import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import type { VendorCustomerCounts } from "@/types/vendor-customers";

interface CustomersHeaderProps {
  counts: VendorCustomerCounts;
}

export function CustomersHeader({ counts }: CustomersHeaderProps) {
  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-4 sm:p-5">
      <Link
        href="/vendor"
        className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-kampmax-text-secondary hover:text-kampmax-blue"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to dashboard
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-kampmax-text">
            <Users className="h-5 w-5 text-kampmax-blue" aria-hidden />
            Customers
          </h1>
          <p className="mt-0.5 text-sm text-kampmax-text-secondary">
            People who have ordered from your store. Details come from your own orders.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip label="All" value={counts.all} className="bg-kampmax-muted/50" />
          <Chip label="New" value={counts.new} className="bg-kampmax-blue/10 text-kampmax-blue" />
          <Chip label="Returning" value={counts.returning} className="bg-kampmax-info/10 text-kampmax-info" />
          <Chip label="Frequent" value={counts.frequent} className="bg-kampmax-gold/10 text-kampmax-gold" />
          <Chip label="Inactive" value={counts.inactive} className="bg-kampmax-muted/50 text-kampmax-text-secondary" />
        </div>
      </div>
    </div>
  );
}

function Chip({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className={`rounded-lg px-3 py-1.5 text-center ${className ?? ""}`}>
      <p className="text-sm font-bold text-kampmax-text">{value}</p>
      <p className="text-[10px] text-kampmax-text-secondary">{label}</p>
    </div>
  );
}