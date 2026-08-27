"use client";

import { Check } from "lucide-react";

interface AddedToCartToastProps {
  visible: boolean;
  quantity: number;
}

export function AddedToCartToast({ visible, quantity }: AddedToCartToastProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
      <Check className="h-4 w-4 text-success-500" />
      Added to cart · {quantity} item{quantity > 1 ? "s" : ""}
    </div>
  );
}