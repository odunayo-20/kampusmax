"use client";

import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import type { VendorCustomerCounts } from "@/types/vendor-customers";

interface CustomerHeaderProps {
  counts: VendorCustomerCounts;
}

export function CustomerHeader({ counts }: CustomerHeaderProps) {
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
            People who have ordered from your store. Derived from your own order history only.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-center">
          <MiniStat label="Total" value={counts.all} />
          <MiniStat label="Frequent" value={counts.frequent} />
          <MiniStat label="New" value={counts.new} />
          <MiniStat label="Inactive" value={counts.inactive} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-kampmax-muted/50 px-3 py-1.5">
      <p className="text-sm font-bold text-kampmax-text">{value}</p>
      <p className="text-[10px] text-kampmax-text-secondary">{label}</p>
    </div>
  );
}