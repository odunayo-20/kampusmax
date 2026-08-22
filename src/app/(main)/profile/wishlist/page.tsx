"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getProductsByCampus } from "@/services/products";
import { useApp } from "@/lib/app-context";
import { formatNaira } from "@/lib/utils";
import { Product } from "@/types";

const mockWishlistIds = ["p1", "p3", "p5", "p8", "p12", "p17"];

export default function WishlistPage() {
  const router = useRouter();
  const { selectedCampus } = useApp();
  const allProducts = getProductsByCampus(selectedCampus.id);
  const [wishlistIds, setWishlistIds] = useState<string[]>(mockWishlistIds);

  const products = allProducts.filter((p) => wishlistIds.includes(p.id));

  function removeItem(id: string) {
    setWishlistIds((prev) => prev.filter((i) => i !== id));
  }

  return (
    <PageContainer className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Profile", href: "/profile" },
          { label: "Wishlist" },
        ]}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-kampmax-text">My Wishlist</h1>
          <p className="text-xs text-kampmax-text-secondary">
            {products.length} item{products.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-kampmax-border p-8 text-center">
          <Heart className="h-10 w-10 text-kampmax-text-secondary mx-auto mb-3" />
          <p className="text-sm font-medium text-kampmax-text">Your wishlist is empty</p>
          <p className="text-xs text-kampmax-text-secondary mt-1">
            Browse the marketplace and tap the heart icon to save items
          </p>
          <button
            onClick={() => router.push("/marketplace")}
            className="mt-4 px-4 py-2 bg-kampmax-blue text-white text-sm font-medium rounded-lg"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-kampmax-border p-4 flex items-center gap-3"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg bg-kampmax-muted flex items-center justify-center flex-shrink-0">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <ShoppingCart className="h-6 w-6 text-kampmax-text-secondary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-kampmax-text truncate">
                  {product.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-kampmax-blue">
                    {formatNaira(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-kampmax-text-secondary line-through">
                      {formatNaira(product.originalPrice)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-kampmax-text-secondary mt-0.5">
                  {product.condition}
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => removeItem(product.id)}
                  className="w-8 h-8 rounded-lg bg-kampmax-error/10 text-kampmax-error flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push(`/marketplace/${product.id}`)}
                  className="w-8 h-8 rounded-lg bg-kampmax-blue/10 text-kampmax-blue flex items-center justify-center"
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
