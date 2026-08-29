"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BadgePercent } from "lucide-react";
import { getVendorPromotionById, updateVendorPromotion, getVendorPromotionFormContext, getVendorPromotionPermissions } from "@/services/vendor-promotions";
import { PromotionForm, type VendorPromotionFormContext } from "@/components/vendor-promotions/PromotionForm";

export default function VendorPromotionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const context = useMemo<VendorPromotionFormContext>(() => getVendorPromotionFormContext(), []);
  const permissions = useMemo(() => getVendorPromotionPermissions(), []);
  const promotion = useMemo(() => getVendorPromotionById(id), [id]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-xl border border-kampmax-border bg-white" aria-hidden />;
  }

  if (!promotion) {
    return (
      <div className="rounded-xl border border-kampmax-border bg-white p-10 text-center">
        <BadgePercent className="mx-auto mb-3 h-10 w-10 text-kampmax-text-secondary" aria-hidden />
        <p className="text-sm font-medium text-kampmax-text">Promotion not found</p>
        <p className="mt-1 text-xs text-kampmax-text-secondary">This promotion may not belong to your store.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href={`/vendor/promotions/${promotion.id}`}
        className="inline-flex items-center gap-1 text-xs font-medium text-kampmax-text-secondary hover:text-kampmax-blue"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to {promotion.title}
      </Link>

      <PromotionForm
        context={context}
        initial={promotion}
        title={`Edit — ${promotion.title}`}
        submitLabel="Save changes"
        onSubmit={(input) => {
          const result = updateVendorPromotion(id, input);
          if (result.ok) {
            router.push(`/vendor/promotions/${id}`);
          }
          return result;
        }}
      />
    </div>
  );
}