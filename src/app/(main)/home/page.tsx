"use client";

import Link from "next/link";
import { Search, ChevronRight, TrendingUp, Star } from "lucide-react";
import { ProductCard, CategoryCard } from "@/components/marketplace";
import { Button, Avatar } from "@/components/ui";
import { useApp } from "@/lib/app-context";
import { getFeaturedProducts, getRecentProducts } from "@/services/products";
import { getCategories } from "@/services/categories";
import { getTopVendors } from "@/services/users";
import { formatNaira } from "@/lib/utils";

export default function HomePage() {
  const { selectedCampus } = useApp();
  const featured = getFeaturedProducts().slice(0, 4);
  const recent = getRecentProducts().slice(0, 6);
  const categories = getCategories();
  const topVendors = getTopVendors();

  return (
    <div className="px-4 py-4 space-y-6">
      <div>
        <p className="text-sm text-kampmax-text-secondary">
          Welcome back, Adebayo 👋
        </p>
        <h1 className="text-xl font-bold text-kampmax-text">
          {selectedCampus.abbreviation} Marketplace
        </h1>
      </div>

      <Link href="/marketplace">
        <div className="flex items-center gap-3 h-11 pl-3 pr-4 bg-white border border-kampmax-border rounded-lg text-kampmax-text-secondary text-sm">
          <Search className="h-4 w-4" />
          <span>Search products, vendors...</span>
        </div>
      </Link>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-kampmax-text">Categories</h2>
          <Link
            href="/marketplace"
            className="text-xs font-medium text-kampmax-blue flex items-center gap-0.5"
          >
            See all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {categories.slice(0, 8).map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-kampmax-gold" />
            <h2 className="text-base font-semibold text-kampmax-text">
              Deals & Discounts
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="text-xs font-medium text-kampmax-blue flex items-center gap-0.5"
          >
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-kampmax-text">
            Recently Added
          </h2>
          <Link
            href="/marketplace"
            className="text-xs font-medium text-kampmax-blue flex items-center gap-0.5"
          >
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {recent.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-kampmax-gold" />
            <h2 className="text-base font-semibold text-kampmax-text">
              Top Vendors
            </h2>
          </div>
        </div>
        <div className="space-y-2">
          {topVendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/marketplace?vendor=${vendor.id}`}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-kampmax-border hover:border-kampmax-blue/50 transition-colors"
            >
              <Avatar name={vendor.storeName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-kampmax-text">
                    {vendor.storeName}
                  </h3>
                  {vendor.verified && (
                    <span className="text-[10px] bg-blue-50 text-kampmax-blue px-1.5 py-0.5 rounded font-medium">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-kampmax-text-secondary">
                  ⭐ {vendor.rating} · {vendor.totalSales} sales
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-kampmax-text-secondary" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
