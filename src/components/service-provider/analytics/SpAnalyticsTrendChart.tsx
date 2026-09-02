"use client";

import { ChartCard } from "@/components/admin/ChartCard";
import type { ChartDatum } from "@/components/admin/ChartCard";
import { nairaAxis } from "@/components/admin/ChartCard";
import type { SpTrendPoint } from "@/types/service-provider-analytics";

interface SpAnalyticsTrendChartProps {
  trend: SpTrendPoint[];
  /** "bookings" | "revenue" — the metric to plot. */
  metric: "bookings" | "revenue";
}

export function SpAnalyticsTrendChart({ trend, metric }: SpAnalyticsTrendChartProps) {
  const data: ChartDatum[] = trend.map((p) => ({
    label: p.label,
    value: metric === "revenue" ? p.revenue : p.bookings,
    secondary: metric === "bookings" ? p.revenue : p.bookings,
  }));

  return (
    <ChartCard
      title={metric === "revenue" ? "Revenue trend" : "Booking trend"}
      subtitle={metric === "revenue" ? "Gross revenue per day" : "Bookings per day"}
      type="area"
      data={data}
      height={220}
      accent="blue"
      formatValue={metric === "revenue" ? nairaAxis : (v) => String(v)}
    />
  );
}
