"use client";

interface PromotionStatsBarProps {
  stats: { active: number; scheduled: number; draft: number; totalUsage: number };
}

export function PromotionStatsBar({ stats }: PromotionStatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Active" value={stats.active} tone="bg-kampmax-success/10 text-kampmax-success" />
      <Stat label="Scheduled" value={stats.scheduled} tone="bg-kampmax-blue/10 text-kampmax-blue" />
      <Stat label="Drafts" value={stats.draft} tone="bg-kampmax-muted text-kampmax-text-secondary" />
      <Stat label="Total redemptions" value={stats.totalUsage} tone="bg-kampmax-gold/10 text-kampmax-gold" />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-4">
      <p className={`mb-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${tone}`}>{value}</p>
      <p className="text-xs text-kampmax-text-secondary">{label}</p>
    </div>
  );
}