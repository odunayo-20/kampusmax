"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Star, MapPin, Verified } from "lucide-react";
import { Product, ProductCondition } from "@/types";
import { cn, formatNaira } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  vendorName?: string;
  vendorVerified?: boolean;
  className?: string;
}

function conditionColor(condition: ProductCondition) {
  return condition === "New"
    ? "bg-primary-50 text-primary-700 border border-primary-100"
    : "bg-accent-50 text-accent-700 border border-accent-100";
}

function discountPercent(original: number, current: number) {
  return Math.round(((original - current) / original) * 100);
}

export function ProductCard({
  product,
  vendorName,
  vendorVerified,
  className,
}: ProductCardProps) {
  const [saved, setSaved] = useState(false);
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;

  return (
    <Link
      href={`/marketplace/${product.id}`}
      className={cn(
        "bg-white rounded-[10px] border border-neutral-200 overflow-hidden group flex flex-col",
        "hover:border-neutral-300 hover:shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1",
        className
      )}
    >
      <div className="relative aspect-[1/1] bg-neutral-50 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-neutral-400/40">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>

        {hasDiscount && (
          <div className="absolute top-2 left-2">
            <span className="bg-error-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none">
              -{discountPercent(product.originalPrice!, product.price)}%
            </span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSaved(!saved);
          }}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={saved}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200 hover:bg-white hover:border-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <Heart
            className={cn(
              "w-3.5 h-3.5 transition-colors",
              saved ? "fill-error-600 text-error-600" : "text-neutral-500"
            )}
          />
        </button>

        <div className="absolute bottom-2 left-2">
          <span
            className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none border",
              conditionColor(product.condition)
            )}
          >
            {product.condition}
          </span>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        {vendorName && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[11px] text-neutral-500 truncate">
              {vendorName}
            </span>
            {vendorVerified && (
              <Verified className="w-3 h-3 text-primary-600 shrink-0" />
            )}
          </div>
        )}

        <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug mb-1 group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>

        {product.location && (
          <div className="flex items-center gap-0.5 mb-1.5">
            <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
            <span className="text-[11px] text-neutral-500 truncate">
              {product.location}
            </span>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-bold text-primary-900 tracking-tight">
              {formatNaira(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through">
                {formatNaira(product.originalPrice!)}
              </span>
            )}
          </div>

          {(product.rating || product.viewCount) && (
            <div className="flex items-center gap-2 mt-1">
              {product.rating && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-accent-500 text-accent-500" />
                  <span className="text-[11px] font-medium text-neutral-900">
                    {product.rating}
                  </span>
                  {product.ratingCount && (
                    <span className="text-[11px] text-neutral-500">
                      ({product.ratingCount})
                    </span>
                  )}
                </div>
              )}
              {product.viewCount && (
                <span className="text-[11px] text-neutral-500">
                  {product.viewCount} views
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
