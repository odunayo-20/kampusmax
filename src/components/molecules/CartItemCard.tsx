"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/types";
import { cn, formatNaira } from "@/lib/utils";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  className?: string;
}

export function CartItemCard({ item, onUpdateQuantity, onRemove, className }: CartItemCardProps) {
  return (
    <div className={cn("flex gap-3 p-3 bg-white rounded-lg border border-kampmax-border", className)}>
      <div className="w-20 h-20 bg-kampmax-muted rounded-md overflow-hidden flex-shrink-0 relative">
        <Image
          src={item.product.images[0] || "/placeholder-product.svg"}
          alt={item.product.title}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-kampmax-text line-clamp-2 leading-tight">
          {item.product.title}
        </h4>
        <p className="text-sm font-bold text-kampmax-navy mt-1">
          {formatNaira(item.product.price)}
        </p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
              className="h-7 w-7 flex items-center justify-center rounded border border-kampmax-border hover:bg-kampmax-muted transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
              className="h-7 w-7 flex items-center justify-center rounded border border-kampmax-border hover:bg-kampmax-muted transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <button
            onClick={() => onRemove(item.product.id)}
            className="h-7 w-7 flex items-center justify-center text-kampmax-text-secondary hover:text-kampmax-error transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
