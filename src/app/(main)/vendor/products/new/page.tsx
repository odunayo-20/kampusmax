"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/vendor-products/ProductForm";
import { createVendorProduct } from "@/services/vendor-products";

export default function AddProductPage() {
  const router = useRouter();

  const handleSave = async (data: any) => {
    await createVendorProduct(data);
    router.push("/vendor/products");
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <h1 className="text-xl font-bold text-kampmax-text">Add New Product</h1>
      </div>

      <ProductForm onSave={handleSave} onCancel={() => router.push("/vendor/products")} />
    </div>
  );
}