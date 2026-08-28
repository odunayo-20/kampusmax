"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface Subcategory {
  id: string;
  name: string;
  productCount: number;
  icon?: string;
}

interface SubcategoryNavigationProps {
  subcategories: Subcategory[];
  activeSubcategoryId?: string;
  onSubcategoryChange: (subcategoryId: string) => void;
  className?: string;
}

export function SubcategoryNavigation({ 
  subcategories, 
  activeSubcategoryId, 
  onSubcategoryChange,
  className 
}: SubcategoryNavigationProps) {
  if (!subcategories.length) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 flex-wrap">
        {subcategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => onSubcategoryChange(activeSubcategoryId === sub.id ? "" : sub.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
              activeSubcategoryId === sub.id
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
            )}
          >
            {sub.icon && <span aria-hidden>{sub.icon}</span>}
            {sub.name}
            <span className={cn(
              "px-1.5 py-0.5 rounded-full text-xs font-semibold",
              activeSubcategoryId === sub.id ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
            )}>
              {sub.productCount}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SubcategoryScrollNav({ 
  subcategories, 
  activeSubcategoryId, 
  onSubcategoryChange,
  className 
}: SubcategoryNavigationProps) {
  if (!subcategories.length) return null;

  return (
    <div className={cn("-mx-4 pb-4", className)}>
      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory no-scrollbar px-4">
        {subcategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => onSubcategoryChange(activeSubcategoryId === sub.id ? "" : sub.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0 snap-start",
              activeSubcategoryId === sub.id
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
            )}
          >
            {sub.icon && <span aria-hidden>{sub.icon}</span>}
            {sub.name}
            <span className={cn(
              "px-1.5 py-0.5 rounded-full text-xs font-semibold",
              activeSubcategoryId === sub.id ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
            )}>
              {sub.productCount}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}