"use client";

import { ShoppingBag, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button";

interface EmptyCartProps {
  campusName?: string;
}

export function EmptyCart({ campusName }: EmptyCartProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-kampmax-muted flex items-center justify-center mb-4">
        <ShoppingBag className="w-10 h-10 text-kampmax-text-secondary/40" />
      </div>
      <h2 className="text-lg font-semibold text-kampmax-text mb-1">
        Your cart is waiting
      </h2>
      <p className="text-sm text-kampmax-text-secondary max-w-sm mb-6">
        Discover products from vendors around your campus and add something
        you love.
      </p>
      {campusName && (
        <p className="flex items-center gap-1 text-xs text-kampmax-text-secondary mb-6">
          <MapPin className="h-3.5 w-3.5 text-kampmax-blue" />
          Showing items available near {campusName}
        </p>
      )}
      <Button
        onClick={() => router.push("/marketplace")}
        className="bg-kampmax-navy text-white hover:bg-kampmax-navy/90"
      >
        Start Shopping
      </Button>
    </div>
  );
}
