"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button";

export function EmptyCart() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-kampmax-muted flex items-center justify-center mb-4">
        <ShoppingBag className="w-10 h-10 text-kampmax-text-secondary/40" />
      </div>
      <h2 className="text-lg font-semibold text-kampmax-text mb-1">
        Your cart is empty
      </h2>
      <p className="text-sm text-kampmax-text-secondary max-w-xs mb-6">
        Browse the marketplace to find something you like. Items you add will
        appear here.
      </p>
      <Button
        onClick={() => router.push("/marketplace")}
        className="bg-kampmax-navy text-white hover:bg-kampmax-navy/90"
      >
        Browse Marketplace
      </Button>
    </div>
  );
}
