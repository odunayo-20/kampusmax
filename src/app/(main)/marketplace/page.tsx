"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/shared";
import { ProductCard, CategoryPill } from "@/components/marketplace";
import { PageContainer } from "@/components/layout";
import { getCategories } from "@/services/categories";
import { getProducts, getProductsByCategory, searchProducts } from "@/services/products";
import { cn } from "@/lib/utils";

type SortOption = "recent" | "price_low" | "price_high";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("category") || "";

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [sort, setSort] = useState<SortOption>("recent");
  const categories = getCategories();

  let filtered = activeCategory
    ? getProductsByCategory(activeCategory)
    : getProducts();

  if (search) {
    filtered = searchProducts(search);
  }

  filtered = [...filtered].sort((a, b) => {
    if (sort === "price_low") return a.price - b.price;
    if (sort === "price_high") return b.price - a.price;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <PageContainer className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-kampmax-text mb-3">Marketplace</h1>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
        <button
          onClick={() => setActiveCategory("")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            !activeCategory
              ? "bg-kampmax-navy text-white"
              : "bg-white text-kampmax-text border border-kampmax-border"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <CategoryPill
            key={cat.id}
            category={cat}
            isActive={activeCategory === cat.id}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-kampmax-text-secondary">
          {filtered.length} products
        </span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="text-xs text-kampmax-text border border-kampmax-border rounded-md px-2 py-1 bg-white focus:outline-none focus:border-kampmax-blue"
        >
          <option value="recent">Most Recent</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg mb-1">No results</p>
          <p className="text-sm font-medium text-kampmax-text">No products found</p>
          <p className="text-xs text-kampmax-text-secondary">
            Try a different search or category
          </p>
        </div>
      )}
    </PageContainer>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="space-y-4">
          <h1 className="text-xl font-bold text-kampmax-text">Marketplace</h1>
          <div className="h-10 bg-kampmax-muted rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-kampmax-muted rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        </PageContainer>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
