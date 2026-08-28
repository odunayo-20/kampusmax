"use client";

import { ShoppingCart, Clock, Package, Star, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardMetric } from "@/types/vendor-dashboard";

const ICON: Record<string, typeof Layers> = {
  orders: ShoppingCart,
  pending_orders: Clock,
  products: Package,
  store_rating: Star,
};

const TONE: Record<string, string> = {
  positive: "text-success-600 bg-success-50",
  negative: "text-error-600 bg-error-50",
  neutral: "text-primary-600 bg-primary-50",
};

export function VendorMetricCard({ metric }: { metric: DashboardMetric }) {
  const Icon = ICON[metric.key] ?? Layers;
  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", TONE[metric.tone])}>
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
      <p className="text-lg font-bold text-kampmax-text">{metric.valueLabel}</p>
      <p className="text-xs text-kampmax-text-secondary">{metric.label}</p>
      {metric.sublabel && (
        <p className="mt-0.5 text-[11px] text-kampmax-text-muted">{metric.sublabel}</p>
      )}
    </div>
  );
}
