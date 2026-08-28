"use client";

import { Package, Users, Star, Zap } from "lucide-react";
import type { Storefront } from "@/types/storefront";

interface StoreOverviewProps {
  store: Storefront;
}

/** Compact store overview strip with public stats + description. */
export function StoreOverview({ store }: StoreOverviewProps) {
  const stats = [
    { icon: <Package className="h-4 w-4" />, label: "Products", value: store.productsCount },
    { icon: <Users className="h-4 w-4" />, label: "Followers", value: store.attestation.followers },
    {
      icon: <Star className="h-4 w-4" />,
      label: "Rating",
      value: store.rating > 0 ? `${store.rating.toFixed(1)} (${store.reviewCount})` : "New",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-kampmax-border divide-y divide-kampmax-border">
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-kampmax-border">
        {stats.map((s) => (
          <div key={s.label} className="px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-kampmax-muted flex items-center justify-center text-kampmax-text-secondary shrink-0">
              {s.icon}
            </div>
            <div>
              <p className="text-lg font-bold text-kampmax-text leading-none">{s.value}</p>
              <p className="text-xs text-kampmax-text-secondary mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-4">
        <p className="text-sm text-kampmax-text-secondary leading-relaxed">
          {store.description}
        </p>
        {store.responseTime && (
          <p className="text-xs text-kampmax-text-secondary mt-2 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" />
            {store.responseTime}
          </p>
        )}
      </div>
    </div>
  );
}
