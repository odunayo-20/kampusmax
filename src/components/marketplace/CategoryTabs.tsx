"use client";

import { Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onCategoryChange("")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0",
          !activeCategoryId
            ? "bg-kampmax-navy text-white"
            : "bg-white text-kampmax-text border border-kampmax-border hover:border-kampmax-blue"
        )}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() =>
            onCategoryChange(activeCategoryId === cat.id ? "" : cat.id)
          }
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0",
            activeCategoryId === cat.id
              ? "bg-kampmax-navy text-white"
              : "bg-white text-kampmax-text border border-kampmax-border hover:border-kampmax-blue"
          )}
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  );
}
