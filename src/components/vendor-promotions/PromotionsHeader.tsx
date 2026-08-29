"use client";

import Link from "next/link";
import { ArrowLeft, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui";

interface PromotionsHeaderProps {
  stats: { active: number; scheduled: number; draft: number; totalUsage: number };
  canCreate: boolean;
}

export function PromotionsHeader({ stats, canCreate }: PromotionsHeaderProps) {
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
            <BadgePercent className="h-5 w-5 text-kampmax-blue" aria-hidden />
            Promotions
          </h1>
          <p className="mt-0.5 text-sm text-kampmax-text-secondary">
            Create discounts and offers. The platform enforces statuses, limits and discount math.
          </p>
        </div>
        {canCreate && (
          <Link href="/vendor/promotions/new">
            <Button variant="primary" size="md">New promotion</Button>
          </Link>
        )}
      </div>
    </div>
  );
}