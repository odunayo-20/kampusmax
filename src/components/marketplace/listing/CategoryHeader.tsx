"use client";

import { cn } from "@/lib/utils";

interface CategoryHeaderProps {
  name: string;
  description?: string;
  productCount: number;
  imageUrl?: string;
  className?: string;
}

export function CategoryHeader({ name, description, productCount, imageUrl, className }: CategoryHeaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">{name}</h1>
          {description && (
            <p className="mt-1 text-sm text-neutral-600 max-w-2xl">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-700 whitespace-nowrap">
            {productCount.toLocaleString()} {productCount === 1 ? "product" : "products"}
          </span>
        </div>
      </div>
      {imageUrl && (
        <div className="relative aspect-video rounded-[10px] overflow-hidden bg-neutral-100">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}