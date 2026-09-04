"use client";

import type { FreelancerPortfolioItem } from "@/types/freelancer";
import { PortfolioCard } from "./PortfolioCard";

export function PortfolioGrid({
  items,
  onAction,
}: {
  items: FreelancerPortfolioItem[];
  onAction?: (item: FreelancerPortfolioItem) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <PortfolioCard key={item.id} item={item} onAction={onAction} />
      ))}
    </div>
  );
}
