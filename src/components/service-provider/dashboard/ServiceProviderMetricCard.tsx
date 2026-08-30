"use client";

import { Wrench, Calendar, Clock, Star, Eye, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceProviderDashboardMetric } from "@/types/service-provider-dashboard";

const ICON: Record<ServiceProviderDashboardMetric["key"], typeof Layers> = {
  active_services: Wrench,
  total_bookings: Calendar,
  upcoming_bookings: Clock,
  average_rating: Star,
  profile_views: Eye,
  response_time: Clock,
};

const TONE: Record<ServiceProviderDashboardMetric["tone"], string> = {
  positive: "text-success-600 bg-success-50",
  neutral: "text-primary-600 bg-primary-50",
  info: "text-info-700 bg-info-50",
  gold: "text-yellow-700 bg-yellow-50",
};

/** Backend-supplied metric card. Never fabricated — only renders what the
 * dashboard service returns. */
export function ServiceProviderMetricCard({ metric }: { metric: ServiceProviderDashboardMetric }) {
  const Icon = ICON[metric.key] ?? Layers;
  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-4">
      <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-lg", TONE[metric.tone])}>
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <p className="text-lg font-bold text-kampmax-text">{metric.valueLabel}</p>
      <p className="text-xs text-kampmax-text-secondary">{metric.label}</p>
      {metric.sublabel && (
        <p className="mt-0.5 text-[11px] text-kampmax-text-muted">{metric.sublabel}</p>
      )}
    </div>
  );
}