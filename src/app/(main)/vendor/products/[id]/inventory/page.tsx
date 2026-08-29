"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getVendorProductById, adjustInventory, getInventoryMovements, updateVendorProduct } from "@/services/vendor-products";
import { ProductInventoryPanel } from "@/components/vendor-products/ProductInventoryPanel";
import type { Product } from "@/types";

export default function ProductInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const product = getVendorProductById(id);

  const handleAdjust = async (input: { type: "add" | "subtract" | "set"; quantity: number; reason: string; expectedStock?: number }) => {
    await adjustInventory(id, input);
    router.refresh();
  };

  const handleSetThreshold = async (threshold: number) => {
    await updateVendorProduct(id, { lowStockThreshold: threshold });
    router.refresh();
  };

  const movements = getInventoryMovements(id);

  if (!product) {
    return (
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center">
            <ArrowLeft className="h-5 w-5 text-kampmax-text" />
          </button>
          <h1 className="text-xl font-bold text-kampmax-text">Inventory</h1>
        </div>
        <div className="bg-white rounded-xl border border-kampmax-border p-8 text-center">
          <p className="text-sm text-kampmax-text">Product not found</p>
          <button onClick={() => router.push("/vendor/products")} className="mt-4 text-kampmax-blue hover:underline text-sm">
            Back to products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push(`/vendor/products/${id}`)} className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-kampmax-text">Inventory</h1>
          <p className="text-sm text-kampmax-text-secondary">{product.title}</p>
        </div>
      </div>

      <ProductInventoryPanel
        product={product}
        onAdjustInventory={handleAdjust}
        onSetThreshold={handleSetThreshold}
        movements={movements}
      />
    </div>
  );
}