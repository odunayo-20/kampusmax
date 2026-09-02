"use client";

import { ChartCard } from "@/components/admin/ChartCard";
import type { ChartDatum } from "@/components/admin/ChartCard";
import { nairaAxis } from "@/components/admin/ChartCard";
import type { SpCategoryMetric } from "@/types/service-provider-analytics";

interface SpAnalyticsCategoryChartProps {
  categories: SpCategoryMetric[];
}

export function SpAnalyticsCategoryChart({ categories }: SpAnalyticsCategoryChartProps) {
  const data: ChartDatum[] = categories.map((c) => ({
    label: c.categoryName,
    value: c.revenue,
    secondary: c.bookings,
  }));

  return (
    <ChartCard
      title="Performance by category"
      subtitle="Revenue by service category"
      type="hbar"
      data={data}
      accent="gold"
      formatValue={nairaAxis}
    />
  );
}
