"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { getVendorProductById, setProductPublishedStatus, archiveVendorProduct, restoreVendorProduct, deleteVendorProduct } from "@/services/vendor-products";
import { ProductDetail } from "@/components/vendor-products/ProductDetail";
import type { Product } from "@/types";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const product = getVendorProductById(id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePublish = async () => {
    await setProductPublishedStatus(id, "active");
    router.refresh();
  };

  const handleUnpublish = async () => {
    await setProductPublishedStatus(id, "inactive");
    router.refresh();
  };

  const handleArchive = async () => {
    await archiveVendorProduct(id);
    router.push("/vendor/products");
  };

  const handleRestore = async () => {
    await restoreVendorProduct(id);
    router.refresh();
  };

  const handleDelete = async () => {
    await deleteVendorProduct(id);
    router.push("/vendor/products");
  };

  const handleInventory = () => {
    router.push(`/vendor/products/${id}/inventory`);
  };

  if (!product) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center">
            <svg className="h-5 w-5 text-kampmax-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-xl font-bold text-kampmax-text">Product Details</h1>
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
    <div className="space-y-4 max-w-6xl">
      <ProductDetail
        product={product}
        onEdit={() => router.push(`/vendor/products/${id}/edit`)}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onArchive={handleArchive}
        onRestore={handleRestore}
        onDelete={handleDelete}
        onInventory={handleInventory}
      />
    </div>
  );
}