"use client";

import Link from "next/link";
import { Search, TrendingUp, Star } from "lucide-react";
import { ProductCard, CategoryCard } from "@/components/marketplace";
import { Avatar } from "@/components/ui";
import { PageContainer, SectionHeader } from "@/components/layout";
import { useApp } from "@/lib/app-context";
import { getFeaturedProducts, getRecentProducts } from "@/services/products";
import { getCategories } from "@/services/categories";
import { getTopVendors } from "@/services/users";

export default function HomePage() {
  const { selectedCampus } = useApp();
  const featured = getFeaturedProducts().slice(0, 4);
  const recent = getRecentProducts().slice(0, 6);
  const categories = getCategories();
  const topVendors = getTopVendors();

  return (
    <PageContainer className="space-y-6">
      <div>
        <p className="text-sm text-kampmax-text-secondary">
          Welcome back, Adebayo
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
        <SectionHeader
          title="Categories"
          action={{ label: "See all", href: "/marketplace" }}
        />
        <div className="grid grid-cols-4 gap-2">
          {categories.slice(0, 8).map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Deals & Discounts"
          icon={<TrendingUp className="h-4 w-4 text-kampmax-gold" />}
          action={{ label: "View all", href: "/marketplace" }}
        />
        <div className="grid grid-cols-2 gap-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Recently Added"
          action={{ label: "View all", href: "/marketplace" }}
        />
        <div className="grid grid-cols-2 gap-3">
          {recent.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Top Vendors"
          icon={<Star className="h-4 w-4 text-kampmax-gold" />}
        />
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
                  {vendor.rating} · {vendor.totalSales} sales
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
