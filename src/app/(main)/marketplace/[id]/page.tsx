"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Heart, Share2, MapPin, Star, MessageCircle,
  ShieldCheck, Truck, Store as StoreIcon, ChevronRight, Minus, Plus, ShoppingCart
} from "lucide-react";
import { Button, PriceTag, ConditionBadge, Avatar } from "@/components/ui";
import { PageContainer, Breadcrumbs } from "@/components/layout";
import { useCart } from "@/lib/cart-context";
import { getProductById, getProductsByCategory } from "@/services/products";
import { getVendorById } from "@/services/users";
import { formatNaira, cn } from "@/lib/utils";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { addItem, itemCount } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  const product = getProductById(id);
  if (!product) {
    return (
      <PageContainer className="text-center py-16">
        <p className="text-sm text-kampmax-text-secondary">Product not found</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          Go back
        </Button>
      </PageContainer>
    );
  }

  const vendor = getVendorById(product.vendorId);
  const similar = getProductsByCategory(product.categoryId)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  function handleAddToCart() {
    if (product) addItem(product, quantity);
  }

  return (
    <div>
      <div className="relative aspect-square bg-kampmax-muted">
        <Image
          src={product.images[0] || "/placeholder-product.svg"}
          alt={product.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-4 left-4 bg-kampmax-error text-white text-xs font-bold px-2 py-1 rounded">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 h-9 w-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <button
            onClick={() => setLiked(!liked)}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white"
          >
            <Heart
              className={cn(
                "h-4 w-4",
                liked ? "fill-kampmax-error text-kampmax-error" : ""
              )}
            />
          </button>
          <button className="h-9 w-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <PageContainer className="space-y-4 -mt-4 relative">
        <Breadcrumbs
          items={[
            { label: "Marketplace", href: "/marketplace" },
            { label: product.title },
          ]}
        />

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-kampmax-text leading-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <PriceTag price={product.price} originalPrice={product.originalPrice} size="lg" />
              <ConditionBadge condition={product.condition} />
            </div>
          </div>
        </div>

        {vendor && (
          <Link
            href={`/marketplace?vendor=${vendor.id}`}
            className="flex items-center gap-3 p-3 bg-kampmax-bg rounded-lg"
          >
            <Avatar name={vendor.storeName} size="md" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-kampmax-text">
                  {vendor.storeName}
                </span>
                {vendor.verified && (
                  <ShieldCheck className="h-4 w-4 text-kampmax-blue" />
                )}
              </div>
              <span className="text-xs text-kampmax-text-secondary">
                {vendor.rating} · {vendor.totalSales} sales
              </span>
            </div>
            <MessageCircle className="h-5 w-5 text-kampmax-text-secondary" />
          </Link>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-kampmax-text">Description</h3>
          <p className="text-sm text-kampmax-text-secondary leading-relaxed">
            {product.description}
          </p>
        </div>

        {product.location && (
          <div className="flex items-center gap-2 text-sm text-kampmax-text-secondary">
            <MapPin className="h-4 w-4" />
            <span>{product.location}, RUGIPO</span>
          </div>
        )}

        <div className="bg-kampmax-bg rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-kampmax-text">Delivery Options</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <StoreIcon className="h-4 w-4 text-kampmax-blue" />
              <span className="text-kampmax-text-secondary">Campus Pickup — Free</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-kampmax-blue" />
              <span className="text-kampmax-text-secondary">Hostel Delivery — ₦500</span>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-kampmax-text">
                Similar Products
              </h3>
              <Link
                href={`/marketplace?category=${product.categoryId}`}
                className="text-xs text-kampmax-blue flex items-center gap-0.5"
              >
                See all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
              {similar.map((p) => (
                <Link
                  key={p.id}
                  href={`/marketplace/${p.id}`}
                  className="w-36 flex-shrink-0 bg-white rounded-lg border border-kampmax-border p-2"
                >
                  <div className="aspect-square bg-kampmax-muted rounded mb-2 relative overflow-hidden">
                    <Image
                      src={p.images[0] || "/placeholder-product.svg"}
                      alt={p.title}
                      fill
                      className="object-cover"
                      sizes="144px"
                    />
                  </div>
                  <p className="text-xs font-medium text-kampmax-text line-clamp-1">
                    {p.title}
                  </p>
                  <p className="text-xs font-bold text-kampmax-navy">
                    {formatNaira(p.price)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-kampmax-border -mx-4 px-4 py-3 safe-bottom">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-kampmax-border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 flex items-center justify-center hover:bg-kampmax-muted transition-colors rounded-l-lg"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 flex items-center justify-center hover:bg-kampmax-muted transition-colors rounded-r-lg"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={handleAddToCart} variant="primary" size="lg" className="flex-1">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart — {formatNaira(product.price * quantity)}
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
