"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Package, Pencil, Trash2 } from "lucide-react";
import { cn, formatNaira } from "@/lib/utils";
import { getVendorProducts, deleteVendorProduct } from "@/services/vendor";
import { VendorProduct, VendorProductStatus } from "@/types";

const statusConfig: Record<VendorProductStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-kampmax-success/10 text-kampmax-success" },
  draft: { label: "Draft", color: "bg-kampmax-muted text-kampmax-text-secondary" },
  sold_out: { label: "Sold Out", color: "bg-kampmax-error/10 text-kampmax-error" },
  archived: { label: "Archived", color: "bg-kampmax-warning/10 text-kampmax-warning" },
};

export default function VendorProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<VendorProduct[]>(getVendorProducts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<VendorProductStatus | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  function handleDelete(id: string) {
    deleteVendorProduct(id);
    setProducts(getVendorProducts());
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-kampmax-text">Products</h1>
          <p className="text-sm text-kampmax-text-secondary">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => router.push("/vendor/products/new")}
          className="flex items-center gap-2 px-4 py-2 bg-kampmax-blue text-white text-sm font-semibold rounded-lg"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kampmax-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kampmax-border text-sm bg-white focus:outline-none focus:border-kampmax-blue"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {(["all", "active", "draft", "sold_out", "archived"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
              filter === f
                ? "bg-kampmax-navy text-white"
                : "bg-white text-kampmax-text-secondary border border-kampmax-border"
            )}
          >
            {f === "all" ? "All" : statusConfig[f].label}
          </button>
        ))}
      </div>

      {/* Product List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-kampmax-border p-8 text-center">
          <Package className="h-10 w-10 text-kampmax-text-secondary mx-auto mb-3" />
          <p className="text-sm font-medium text-kampmax-text">No products found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-kampmax-border p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg bg-kampmax-muted flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-kampmax-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", statusConfig[product.status].color)}>
                      {statusConfig[product.status].label}
                    </span>
                    {product.stock <= 3 && product.status === "active" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-kampmax-warning/10 text-kampmax-warning">
                        Low Stock
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-kampmax-text truncate">
                    {product.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-kampmax-text-secondary">
                    <span className="font-bold text-kampmax-text">{formatNaira(product.price)}</span>
                    <span>{product.stock} in stock</span>
                    <span>{product.soldCount} sold</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => router.push(`/vendor/products/${product.id}/edit`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-kampmax-muted text-xs font-medium text-kampmax-text hover:bg-kampmax-muted/80"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                {deletingId === product.id ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-kampmax-error">Delete?</span>
                    <button onClick={() => handleDelete(product.id)} className="text-xs text-kampmax-error font-medium">Yes</button>
                    <button onClick={() => setDeletingId(null)} className="text-xs text-kampmax-text-secondary">No</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(product.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-kampmax-error hover:bg-kampmax-error/10 ml-auto"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
