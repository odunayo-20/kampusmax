"use client";

import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, BadgePercent } from "lucide-react";
import {
  getVendorPromotionById,
  getVendorPromotionProductTitles,
  getVendorPromotionRedemptions,
  getVendorPromotionPermissions,
} from "@/services/vendor-promotions";
import { getCategoryById } from "@/services/categories";
import { PromotionOverviewPanel } from "@/components/vendor-promotions/PromotionOverviewPanel";
import { PromotionRedemptionsPanel } from "@/components/vendor-promotions/PromotionRedemptionsPanel";
import { PromotionRowActions } from "@/components/vendor-promotions/PromotionRowActions";
import { PromotionsSkeleton } from "@/components/vendor-promotions/PromotionsSkeleton";

export default function VendorPromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const data = useMemo(() => {
    const promotion = getVendorPromotionById(id);
    if (!promotion) return null;
    return {
      promotion,
      productTitles: getVendorPromotionProductTitles(id),
      redemptions: getVendorPromotionRedemptions(id),
      categoryName: promotion.categoryId ? getCategoryById(promotion.categoryId)?.name : undefined,
    };
  }, [id, tick]);

  const permissions = useMemo(() => getVendorPromotionPermissions(), []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <PromotionsSkeleton />;

  if (!data) {
    return (
      <div className="rounded-xl border border-kampmax-border bg-white p-10 text-center">
        <BadgePercent className="mx-auto mb-3 h-10 w-10 text-kampmax-text-secondary" aria-hidden />
        <p className="text-sm font-medium text-kampmax-text">Promotion not found</p>
        <p className="mt-1 text-xs text-kampmax-text-secondary">This promotion may not belong to your store.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/vendor/promotions"
          className="inline-flex items-center gap-1 text-xs font-medium text-kampmax-text-secondary hover:text-kampmax-blue"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to promotions
        </Link>
        <PromotionRowActions promotion={data.promotion} permissions={permissions} onChanged={() => setTick((t) => t + 1)} />
      </div>

      <PromotionOverviewPanel
        promotion={data.promotion}
        productTitles={data.productTitles}
        categoryName={data.categoryName}
      />

      <PromotionRedemptionsPanel redemptions={data.redemptions} />
    </div>
  );
}