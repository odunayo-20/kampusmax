"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import {
  getVendorProducts,
  getVendorProductCounts,
  getCategoriesForVendor,
  getCampusesForVendor,
  setProductPublishedStatus,
  archiveVendorProduct,
  restoreVendorProduct,
  deleteVendorProduct,
} from "@/services/vendor-products";
import { ProductHeader } from "@/components/vendor-products/ProductHeader";
import { ProductToolbar } from "@/components/vendor-products/ProductToolbar";
import { ProductFilters } from "@/components/vendor-products/ProductFilters";
import { ProductsTable } from "@/components/vendor-products/ProductsTable";
import { ProductGrid } from "@/components/vendor-products/ProductGrid";
import { ProductPagination } from "@/components/vendor-products/ProductPagination";
import { BulkActions } from "@/components/vendor-products/BulkActions";
import type { Product } from "@/types";
import type { ProductPublishStatus, ProductStockStatus, ProductSortField } from "@/types/vendor-products";

const PAGE_SIZE = 20;

export default function VendorProductsPage({ params }: { params: Promise<{}> }) {
  use(params);
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProductSortField>("newest");
  const [statusFilter, setStatusFilter] = useState<ProductPublishStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<ProductStockStatus | "all">("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState<Record<ProductPublishStatus | "all", number>>({
    all: 0,
    draft: 0,
    pending_review: 0,
    active: 0,
    inactive: 0,
    rejected: 0,
    archived: 0,
  });
  const [categories] = useState(() => getCategoriesForVendor());
  const [campuses] = useState(() => getCampusesForVendor());

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
    const selected = new Set(selectedIds);
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = {
          search,
          status: statusFilter,
          categoryId: categoryFilter === "all" ? undefined : categoryFilter,
          stockStatus: stockFilter === "all" ? undefined : stockFilter,
          minPrice: priceMin ? Number(priceMin) : undefined,
          maxPrice: priceMax ? Number(priceMax) : undefined,
          sort,
          page,
          pageSize: PAGE_SIZE,
        };
        const result = getVendorProducts(query);
        setProducts(result.items);
        setTotal(result.total);
        setTotalPages(result.totalPages);

        const counts = getVendorProductCounts();
        setStatusCounts(counts);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, search, sort, statusFilter, categoryFilter, stockFilter, priceMin, priceMax]);

  const handleBulkPublish = async () => {
    setBulkActionLoading(true);
    try {
      for (const id of selectedIds) {
        const product = products.find((p) => p.id === id);
        if (product && product.publishedStatus !== "active") {
          setProductPublishedStatus(id, "active");
        }
      }
      setSelectedIds([]);
      setPage(1);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkUnpublish = async () => {
    setBulkActionLoading(true);
    try {
      for (const id of selectedIds) {
        const product = products.find((p) => p.id === id);
        if (product && product.publishedStatus === "active") {
          setProductPublishedStatus(id, "inactive");
        }
      }
      setSelectedIds([]);
      setPage(1);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkArchive = async () => {
    setBulkActionLoading(true);
    try {
      for (const id of selectedIds) {
        const product = products.find((p) => p.id === id);
        if (product && product.publishedStatus !== "archived") {
          archiveVendorProduct(id);
        }
      }
      setSelectedIds([]);
      setPage(1);
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ProductHeader totalCount={total} onAddProduct={() => router.push("/vendor/products/new")} />

      <ProductToolbar
        searchValue={search}
        onSearchChange={setSearch}
        sortValue={sort}
        onSortChange={(v) => { setSort(v as ProductSortField); setPage(1); }}
        hasActiveFilters={
          statusFilter !== "all" ||
          categoryFilter !== "all" ||
          stockFilter !== "all" ||
          Boolean(priceMin) ||
          Boolean(priceMax)
        }
        onClearFilters={() => {
          setStatusFilter("all");
          setCategoryFilter("all");
          setStockFilter("all");
          setPriceMin("");
          setPriceMax("");
          setPage(1);
        }}
      />

      <ProductFilters
        statusFilter={statusFilter}
        onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
        categoryFilter={categoryFilter}
        onCategoryChange={(v) => { setCategoryFilter(v); setPage(1); }}
        stockFilter={stockFilter}
        onStockChange={(v) => { setStockFilter(v); setPage(1); }}
        priceMin={priceMin}
        onPriceMinChange={setPriceMin}
        priceMax={priceMax}
        onPriceMaxChange={setPriceMax}
        categories={categories}
        statusCounts={statusCounts}
      />

      <div className="hidden md:block">
        <ProductsTable
          products={products}
          onView={(p) => router.push(`/vendor/products/${p.id}`)}
          onEdit={(p) => router.push(`/vendor/products/${p.id}/edit`)}
          onPublish={(p) => {
            setProductPublishedStatus(p.id, "active");
            setPage(1);
          }}
          onArchive={(p) => {
            archiveVendorProduct(p.id);
            setPage(1);
          }}
          onRestore={(p) => {
            restoreVendorProduct(p.id);
            setPage(1);
          }}
          onDelete={(p) => {
            deleteVendorProduct(p.id);
            setPage(1);
          }}
          bulkAction={{
            selectedIds,
            onSelectAll: (checked) => setSelectedIds(checked ? products.map((p) => p.id) : []),
            onSelectionChange: setSelectedIds,
            onBulkPublish: handleBulkPublish,
            onBulkUnpublish: handleBulkUnpublish,
            onBulkArchive: handleBulkArchive,
          }}
        />
      </div>

      <div className="md:hidden">
        <ProductGrid
          products={products}
          onView={(p) => router.push(`/vendor/products/${p.id}`)}
          onEdit={(p) => router.push(`/vendor/products/${p.id}/edit`)}
          onPublish={(p) => {
            setProductPublishedStatus(p.id, "active");
            setPage(1);
          }}
          onArchive={(p) => {
            archiveVendorProduct(p.id);
            setPage(1);
          }}
          onRestore={(p) => {
            restoreVendorProduct(p.id);
            setPage(1);
          }}
          onDelete={(p) => {
            deleteVendorProduct(p.id);
            setPage(1);
          }}
        />
      </div>

      <ProductPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <BulkActions
        selectedCount={selectedIds.length}
        onBulkPublish={handleBulkPublish}
        onBulkUnpublish={handleBulkUnpublish}
        onBulkArchive={handleBulkArchive}
        onClearSelection={() => setSelectedIds([])}
        disabled={bulkActionLoading}
      />
    </div>
  );
}