"use client";

import Link from "next/link";
import {
  BookOpen,
  Laptop,
  Shirt,
  Gamepad2,
  Home,
  UtensilsCrossed,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Category } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  cat1: BookOpen,
  cat2: Laptop,
  cat3: Shirt,
  cat4: Gamepad2,
  cat5: Home,
  cat6: UtensilsCrossed,
  cat7: Sparkles,
  cat8: Wrench,
};

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[category.id] ?? BookOpen;
  return (
    <Link
      href={`/marketplace?category=${category.id}`}
      className={cn(
        "group flex flex-col items-center gap-2.5 p-3.5 bg-white rounded-xl border border-kampmax-border",
        "hover:border-kampmax-blue/30 hover:shadow-sm transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kampmax-blue focus-visible:ring-offset-1",
        className
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-kampmax-muted text-kampmax-navy transition-colors group-hover:bg-kampmax-blue/10 group-hover:text-kampmax-blue">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="text-xs font-semibold text-kampmax-text text-center leading-tight">
        {category.name}
      </span>
      <span className="text-[11px] font-medium text-kampmax-text-secondary">
        {category.productCount} items
      </span>
    </Link>
  );
}

interface CategoryPillProps {
  category: Category;
  isActive?: boolean;
  className?: string;
}

export function CategoryPill({ category, isActive, className }: CategoryPillProps) {
  const Icon = CATEGORY_ICONS[category.id] ?? BookOpen;
  return (
    <Link
      href={`/marketplace?category=${category.id}`}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap",
        "transition-colors duration-200",
        isActive
          ? "bg-kampmax-navy text-white"
          : "bg-white text-kampmax-text border border-kampmax-border hover:border-kampmax-blue",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      <span>{category.name}</span>
    </Link>
  );
}
