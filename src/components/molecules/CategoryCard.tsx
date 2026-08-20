"use client";

import Link from "next/link";
import { Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link
      href={`/marketplace?category=${category.id}`}
      className={cn(
        "flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-kampmax-border",
        "hover:border-kampmax-blue hover:shadow-sm transition-all duration-200",
        className
      )}
    >
      <span className="text-3xl">{category.icon}</span>
      <span className="text-xs font-medium text-kampmax-text text-center leading-tight">
        {category.name}
      </span>
      <span className="text-[10px] text-kampmax-text-secondary">
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
      <span>{category.icon}</span>
      <span>{category.name}</span>
    </Link>
  );
}
