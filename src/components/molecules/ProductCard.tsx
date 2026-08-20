"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { PriceTag } from "@/components/atoms/PriceTag";
import { ConditionBadge } from "@/components/atoms/Badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <Link
      href={`/marketplace/${product.id}`}
      className={cn(
        "bg-white rounded-lg border border-kampmax-border overflow-hidden",
        "hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      <div className="aspect-square bg-kampmax-muted relative overflow-hidden">
        <Image
          src={product.images[0] || "/placeholder-product.svg"}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 33vw"
        />
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-2 left-2 bg-kampmax-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-kampmax-text line-clamp-2 mb-1 leading-tight">
          {product.title}
        </h3>
        <PriceTag price={product.price} size="sm" />
        <div className="flex items-center justify-between mt-2">
          <ConditionBadge condition={product.condition} />
          {product.location && (
            <span className="text-[10px] text-kampmax-text-secondary truncate ml-1">
              {product.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
