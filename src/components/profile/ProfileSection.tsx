"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ============================================================
// ProfileStatCard
// ============================================================

interface ProfileStatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  onClick?: () => void;
  className?: string;
}

export function ProfileStatCard({
  icon,
  label,
  value,
  onClick,
  className,
}: ProfileStatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 p-3 rounded-xl bg-kampmax-muted/50 border border-kampmax-border transition-colors",
        onClick && "active:bg-kampmax-muted hover:border-kampmax-blue/30 cursor-pointer",
        className
      )}
    >
      <span className="text-kampmax-blue">{icon}</span>
      <span className="text-base font-bold text-kampmax-text">{value}</span>
      <span className="text-[11px] text-kampmax-text-secondary text-center leading-tight">
        {label}
      </span>
    </button>
  );
}

// ============================================================
// ProfileMenuGrid
// ============================================================

interface ProfileMenuGridItem {
  icon: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
}

interface ProfileMenuGridProps {
  items: ProfileMenuGridItem[];
  columns?: 2 | 3 | 4;
}

export function ProfileMenuGrid({ items, columns = 3 }: ProfileMenuGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div className={cn("grid gap-3", gridCols[columns])}>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className="relative flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-kampmax-border hover:border-kampmax-blue/30 active:bg-kampmax-muted transition-colors"
        >
          <span className="text-kampmax-blue">{item.icon}</span>
          <span className="text-xs font-medium text-kampmax-text text-center leading-tight">
            {item.label}
          </span>
          {item.badge !== undefined && item.badge !== 0 && (
            <span className="absolute top-2 right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-kampmax-error text-white text-[10px] font-bold px-1">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// ProfileLoyaltyBadge
// ============================================================

interface ProfileLoyaltyBadgeProps {
  tier: string;
  points: number;
  nextTier?: string;
  progress?: number;
}

const tierColors: Record<string, string> = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-gray-400 to-gray-600",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-purple-500 to-purple-700",
};

const tierLabels: Record<string, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

export function ProfileLoyaltyBadge({
  tier,
  points,
  nextTier,
  progress = 0,
}: ProfileLoyaltyBadgeProps) {
  return (
    <div className="bg-white rounded-xl border border-kampmax-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold",
              tierColors[tier] || tierColors.bronze
            )}
          >
            {tierLabels[tier]?.[0] || "B"}
          </div>
          <div>
            <p className="text-sm font-semibold text-kampmax-text">
              {tierLabels[tier] || tier} Member
            </p>
            <p className="text-[11px] text-kampmax-text-secondary">
              {points.toLocaleString()} pts available
            </p>
          </div>
        </div>
      </div>
      {nextTier && (
        <div>
          <div className="flex items-center justify-between text-[11px] text-kampmax-text-secondary mb-1">
            <span>{tierLabels[tier] || tier}</span>
            <span>{tierLabels[nextTier] || nextTier}</span>
          </div>
          <div className="h-1.5 bg-kampmax-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-kampmax-blue to-kampmax-gold rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
