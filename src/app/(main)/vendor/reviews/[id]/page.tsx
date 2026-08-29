"use client";

import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquareX } from "lucide-react";
import { getVendorReviewById, getVendorReviewPermissions } from "@/services/vendor-reviews";
import { VendorReviewListItem } from "@/components/vendor-reviews/VendorReviewListItem";
import { ReviewsSkeleton } from "@/components/vendor-reviews/ReviewsSkeleton";

export default function VendorReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const data = useMemo(() => {
    const found = getVendorReviewById(id);
    if (!found) return null;
    return { ...found };
  }, [id, tick]);

  const permissions = useMemo(() => getVendorReviewPermissions(), []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <ReviewsSkeleton />;

  if (!data) {
    return (
      <div className="rounded-xl border border-kampmax-border bg-white p-10 text-center">
        <MessageSquareX className="mx-auto mb-3 h-10 w-10 text-kampmax-text-secondary" aria-hidden />
        <p className="text-sm font-medium text-kampmax-text">Review not found</p>
        <p className="mt-1 text-xs text-kampmax-text-secondary">
          This review may not belong to your store.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/vendor/reviews"
        className="inline-flex items-center gap-1 text-xs font-medium text-kampmax-text-secondary hover:text-kampmax-blue"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to reviews
      </Link>

      <VendorReviewListItem
        review={data.review}
        productTitle={data.productTitle}
        permissions={permissions}
        onChanged={() => setTick((t) => t + 1)}
      />

      <p className="px-1 text-xs text-kampmax-text-secondary">
        Tip: reply to unanswered reviews to show customers you care. You can edit or delete your response at any time.
      </p>
    </div>
  );
}