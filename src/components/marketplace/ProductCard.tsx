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
    ? "bg-kampmax-blue/10 text-kampmax-blue"
    : "bg-kampmax-gold/20 text-yellow-700";
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
        "bg-white rounded-xl border border-kampmax-border overflow-hidden group hover:shadow-md transition-all duration-200 flex flex-col",
        className
      )}
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>

        {hasDiscount && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              -{discountPercent(product.originalPrice!, product.price)}%
            </span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            setSaved(!saved);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              saved ? "fill-red-500 text-red-500" : "text-gray-400"
            )}
          />
        </button>

        <div className="absolute bottom-2 left-2">
          <span
            className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded",
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
            <span className="text-[10px] text-kampmax-text-secondary truncate">
              {vendorName}
            </span>
            {vendorVerified && (
              <Verified className="w-3 h-3 text-kampmax-blue shrink-0" />
            )}
          </div>
        )}

        <h3 className="text-sm font-medium text-kampmax-text line-clamp-2 leading-snug mb-1 group-hover:text-kampmax-blue transition-colors">
          {product.title}
        </h3>

        {product.location && (
          <div className="flex items-center gap-0.5 mb-1.5">
            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-[10px] text-kampmax-text-secondary truncate">
              {product.location}
            </span>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-kampmax-navy">
              {formatNaira(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatNaira(product.originalPrice!)}
              </span>
            )}
          </div>

          {(product.rating || product.viewCount) && (
            <div className="flex items-center gap-2 mt-1">
              {product.rating && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-kampmax-gold text-kampmax-gold" />
                  <span className="text-[10px] font-medium text-kampmax-text">
                    {product.rating}
                  </span>
                  {product.ratingCount && (
                    <span className="text-[10px] text-kampmax-text-secondary">
                      ({product.ratingCount})
                    </span>
                  )}
                </div>
              )}
              {product.viewCount && (
                <span className="text-[10px] text-kampmax-text-secondary">
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
