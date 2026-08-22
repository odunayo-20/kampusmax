"use client";

import { Star, Info, Zap } from "lucide-react";
import { cn, formatNaira } from "@/lib/utils";

interface LoyaltyPointsSectionProps {
  availablePoints: number;
  maxPoints: number;
  pointsToUse: number;
  useAllPoints: boolean;
  onPointsChange: (pts: number) => void;
  onToggleAll: () => void;
}

export function LoyaltyPointsSection({
  availablePoints,
  maxPoints,
  pointsToUse,
  useAllPoints,
  onPointsChange,
  onToggleAll,
}: LoyaltyPointsSectionProps) {
  if (availablePoints <= 0) return null;

  return (
    <section className="bg-white rounded-xl border border-kampmax-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-kampmax-text flex items-center gap-2">
          <Star className="h-4 w-4 text-kampmax-gold" />
          Loyalty Points
        </h3>
        <span className="text-xs font-medium text-kampmax-text-secondary bg-kampmax-muted px-2 py-0.5 rounded-full">
          {availablePoints.toLocaleString()} pts available
        </span>
      </div>

      <div className="flex items-start gap-2 p-2.5 bg-kampmax-blue/10 rounded-lg">
        <Info className="w-3.5 h-3.5 text-kampmax-blue shrink-0 mt-0.5" />
        <p className="text-[11px] text-kampmax-text-secondary leading-relaxed">
          Use up to {maxPoints.toLocaleString()} points (30% of order). 
          1 point = ₦1. You&apos;ll earn 5% back as points on this order.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={maxPoints}
            step={10}
            value={useAllPoints ? maxPoints : pointsToUse}
            onChange={(e) => onPointsChange(Number(e.target.value))}
            className="w-full h-2 bg-kampmax-border rounded-lg appearance-none cursor-pointer accent-kampmax-blue"
          />
        </div>
        <span className="text-sm font-semibold text-kampmax-navy tabular-nums w-16 text-right">
          {useAllPoints ? maxPoints : pointsToUse} pts
        </span>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onToggleAll}
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
            useAllPoints
              ? "bg-kampmax-blue text-white border-kampmax-blue"
              : "bg-white text-kampmax-text border-kampmax-border hover:border-kampmax-blue"
          )}
        >
          <Zap className="w-3 h-3" />
          Use max ({maxPoints.toLocaleString()} pts = {formatNaira(maxPoints)})
        </button>

        {pointsToUse > 0 && (
          <span className="text-xs text-kampmax-success font-medium">
            -{formatNaira(pointsToUse)}
          </span>
        )}
      </div>
    </section>
  );
}
