"use client";

import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import type { VendorReviewCounts } from "@/types/vendor-reviews";

interface ReviewsHeaderProps {
  counts: VendorReviewCounts;
}

export function ReviewsHeader({ counts }: ReviewsHeaderProps) {
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
            <Star className="h-5 w-5 text-kampmax-gold" aria-hidden />
            Reviews & Ratings
          </h1>
          <p className="mt-0.5 text-sm text-kampmax-text-secondary">
            Store and product reviews you received. Reply to reviews you own; you can't edit or remove customer reviews.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip label="Total" value={counts.all} className="bg-kampmax-muted/50" />
          <Chip label="Responded" value={counts.answered} className="bg-kampmax-success/10 text-kampmax-success" />
          <Chip label="Unanswered" value={counts.unanswered} className="bg-kampmax-warning/10 text-amber-700" />
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