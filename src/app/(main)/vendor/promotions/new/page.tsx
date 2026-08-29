"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createVendorPromotion, getVendorPromotionFormContext, getVendorPromotionPermissions } from "@/services/vendor-promotions";
import { PromotionForm, type VendorPromotionFormContext } from "@/components/vendor-promotions/PromotionForm";

export default function VendorPromotionNewPage({ params }: { params: Promise<{}> }) {
  use(params);
  const router = useRouter();

  const context = useMemo<VendorPromotionFormContext>(() => getVendorPromotionFormContext(), []);
  const permissions = useMemo(() => getVendorPromotionPermissions(), []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-xl border border-kampmax-border bg-white" aria-hidden />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/vendor/promotions"
        className="inline-flex items-center gap-1 text-xs font-medium text-kampmax-text-secondary hover:text-kampmax-blue"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to promotions
      </Link>

      <PromotionForm
        context={context}
        title="New promotion"
        submitLabel="Save draft"
        onSubmit={(input) => {
          const result = createVendorPromotion(input);
          if (result.ok && result.promotion) {
            router.push(`/vendor/promotions/${result.promotion.id}`);
          }
          return result;
        }}
      />
    </div>
  );
}