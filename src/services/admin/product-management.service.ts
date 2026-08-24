import {
  ListQuery,
  ManagedProduct,
  ManagedProductDetail,
  Paginated,
  ProductActivityEvent,
  ProductFacets,
  ProductStatusCounts,
} from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";
import { buildManagedProductDataset } from "@/data/admin/product-management";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/products)
// ------------------------------------------------------------

export type ManagedProductSortField =
  | "title"
  | "price"
  | "stock"
  | "salesCount"
  | "revenue"
  | "rating"
  | "createdAt";

export type ProductStockFilter = "any" | "in_stock" | "low_stock" | "out_of_stock";

export interface ManagedProductListFilters {
  status?: ManagedProduct["status"] | "all";
  categoryId?: string | "all";
  campusId?: string | "all";
  vendorId?: string | "all";
  priceMin?: number | null;
  priceMax?: number | null;
  stock?: ProductStockFilter;
}

export interface ManagedProductListQuery
  extends ListQuery,
    ManagedProductListFilters {}

export interface AdminProductManagementService {
  list(query?: ManagedProductListQuery): Promise<Paginated<ManagedProduct>>;
  getById(id: string): Promise<ManagedProductDetail | null>;
  getCounts(): Promise<ProductStatusCounts>;
  getFacets(): Promise<ProductFacets>;
  approve(id: string): Promise<ManagedProduct>;
  reject(id: string, reason: string): Promise<ManagedProduct>;
  suspend(id: string, reason: string): Promise<ManagedProduct>;
  archive(id: string): Promise<ManagedProduct>;
  restore(id: string): Promise<ManagedProduct>;
  getActivity(id: string): Promise<ProductActivityEvent[]>;
}

// ------------------------------------------------------------
// MOCK IMPLEMENTATION
// ------------------------------------------------------------

const LOW_STOCK_THRESHOLD = 5;

export function createProductManagementService(
  seed?: ReturnType<typeof buildManagedProductDataset>
): AdminProductManagementService {
  const dataset = seed ?? buildManagedProductDataset();
  const products = dataset.products.map((p) => ({ ...p }));
  const details = new Map<string, ManagedProductDetail>();
  // Deep-copy details so module-level mock data stays pristine.
  dataset.details.forEach((detail, id) => details.set(id, structuredCopy(detail)));

  function findOrThrow(id: string): ManagedProduct {
    const product = products.find((p) => p.id === id);
    if (!product) throw new Error(`Product ${id} not found`);
    return product;
  }

  function replace(updated: ManagedProduct): void {
    const idx = products.findIndex((p) => p.id === updated.id);
    if (idx === -1) throw new Error(`Product ${updated.id} not found`);
    products[idx] = updated;
    const detail = details.get(updated.id);
    if (detail) detail.product = structuredCopy(updated);
  }

  function logActivity(productId: string, message: string, meta = "Admin console"): void {
    const detail = details.get(productId);
    if (!detail) return;
    detail.activity.unshift({
      id: `pact-${productId}-admin-${detail.activity.length + 1}`,
      kind: "admin",
      message,
      meta,
      at: new Date().toISOString(),
    });
  }

  /** Trading state a restored/approved listing lands in. */
  function tradingState(product: ManagedProduct): ManagedProduct["status"] {
    return product.stock > 0 ? "active" : "out_of_stock";
  }

  return {
    async list(query = {}) {
      await apiDelay();
      const {
        search,
        sortBy,
        sortDir = "desc",
        page = 1,
        pageSize = 10,
        status = "all",
        categoryId = "all",
        campusId = "all",
        vendorId = "all",
        priceMin = null,
        priceMax = null,
        stock = "any",
      } = query;

      let rows = products.filter(
        (p) =>
          (status === "all" || p.status === status) &&
          (categoryId === "all" || p.categoryId === categoryId) &&
          (campusId === "all" || p.campusId === campusId) &&
          (vendorId === "all" || p.vendorId === vendorId) &&
          (priceMin == null || p.price >= priceMin) &&
          (priceMax == null || p.price <= priceMax) &&
          (stock === "any" ||
            (stock === "in_stock" && p.stock > LOW_STOCK_THRESHOLD) ||
            (stock === "low_stock" && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD) ||
            (stock === "out_of_stock" && p.stock === 0))
      );

      rows = applySearch(rows, search, (p) => [
        p.title,
        p.vendorName,
        p.categoryName,
        p.id,
      ]);

      rows = applySort(
        rows,
        sortBy,
        sortDir,
        {
          title: (p) => p.title.toLowerCase(),
          price: (p) => p.price,
          stock: (p) => p.stock,
          salesCount: (p) => p.salesCount,
          revenue: (p) => p.revenue,
          rating: (p) => p.rating,
          createdAt: (p) => new Date(p.createdAt).getTime(),
        },
        "createdAt"
      );

      return paginate(rows, { page, pageSize });
    },

    async getById(id) {
      await apiDelay(160);
      return details.get(id) ?? null;
    },

    async getCounts() {
      await apiDelay(80);
      const by = (status: ManagedProduct["status"]) =>
        products.filter((p) => p.status === status).length;
      return {
        all: products.length,
        active: by("active"),
        pending_approval: by("pending_approval"),
        rejected: by("rejected"),
        out_of_stock: by("out_of_stock"),
        suspended: by("suspended"),
        archived: by("archived"),
      };
    },

    async getFacets() {
      await apiDelay(60);
      return {
        categories: [
          ...new Map(
            products.map((p) => [
              p.categoryId,
              { id: p.categoryId, name: p.categoryName },
            ])
          ).values(),
        ].sort((a, b) => a.name.localeCompare(b.name)),
        campuses: [
          ...new Map(
            products.map((p) => [
              p.campusId,
              {
                id: p.campusId,
                name:
                  dataset.details.get(p.id)?.campus?.shortName ?? p.campusId,
              },
            ])
          ).values(),
        ],
        vendors: [
          ...new Map(
            products.map((p) => [p.vendorId, { id: p.vendorId, name: p.vendorName }])
          ).values(),
        ].sort((a, b) => a.name.localeCompare(b.name)),
      };
    },

    async approve(id) {
      await apiDelay();
      const product = findOrThrow(id);
      if (product.status !== "pending_approval") {
        throw new Error(`Only pending listings can be approved (current: ${product.status}).`);
      }
      const updated: ManagedProduct = {
        ...product,
        status: tradingState(product),
        moderation: {
          ...product.moderation,
          reviewedAt: new Date().toISOString(),
          reviewedBy: "Platform Admin",
          rejectionReason: null,
        },
        updatedAt: new Date().toISOString(),
      };
      replace(updated);
      logActivity(id, "Listing approved · now live on the marketplace", "Moderation");
      return updated;
    },

    async reject(id, reason) {
      await apiDelay();
      const product = findOrThrow(id);
      if (!reason.trim()) throw new Error("A rejection reason is required.");
      if (product.status !== "pending_approval") {
        throw new Error(`Only pending listings can be rejected (current: ${product.status}).`);
      }
      const updated: ManagedProduct = {
        ...product,
        status: "rejected",
        moderation: {
          ...product.moderation,
          reviewedAt: new Date().toISOString(),
          reviewedBy: "Platform Admin",
          rejectionReason: reason.trim(),
        },
        updatedAt: new Date().toISOString(),
      };
      replace(updated);
      logActivity(id, `Rejected · ${reason.trim()}`, "Moderation");
      return updated;
    },

    async suspend(id, reason) {
      await apiDelay();
      const product = findOrThrow(id);
      if (!reason.trim()) throw new Error("A suspension reason is required.");
      if (product.status !== "active" && product.status !== "out_of_stock") {
        throw new Error(`Only live listings can be suspended (current: ${product.status}).`);
      }
      const updated: ManagedProduct = {
        ...product,
        status: "suspended",
        moderation: {
          ...product.moderation,
          suspensionReason: reason.trim(),
        },
        updatedAt: new Date().toISOString(),
      };
      replace(updated);
      logActivity(id, `Suspended · ${reason.trim()}`, "Moderation");
      return updated;
    },

    async archive(id) {
      await apiDelay();
      const product = findOrThrow(id);
      if (product.status === "archived") {
        throw new Error("Listing is already archived.");
      }
      if (product.status === "pending_approval") {
        throw new Error("Reject the listing instead of archiving it.");
      }
      const updated: ManagedProduct = {
        ...product,
        status: "archived",
        updatedAt: new Date().toISOString(),
      };
      replace(updated);
      logActivity(id, "Listing archived and removed from the marketplace");
      return updated;
    },

    async restore(id) {
      await apiDelay();
      const product = findOrThrow(id);
      if (
        product.status !== "archived" &&
        product.status !== "suspended" &&
        product.status !== "rejected" &&
        product.status !== "out_of_stock"
      ) {
        throw new Error(`Listing cannot be restored from "${product.status}".`);
      }
      const wasRejected = product.status === "rejected";
      const updated: ManagedProduct = {
        ...product,
        status: tradingState(product),
        moderation: {
          ...product.moderation,
          rejectionReason: wasRejected
            ? null
            : product.moderation.rejectionReason,
          suspensionReason: product.status === "suspended"
            ? null
            : product.moderation.suspensionReason,
          reviewedAt: wasRejected ? new Date().toISOString() : product.moderation.reviewedAt,
          reviewedBy: wasRejected ? "Platform Admin" : product.moderation.reviewedBy,
        },
        updatedAt: new Date().toISOString(),
      };
      replace(updated);
      logActivity(id, "Listing restored to the marketplace");
      return updated;
    },

    async getActivity(id) {
      await apiDelay(120);
      return details.get(id)?.activity ?? [];
    },
  };
}

/** Structured clone with Date-free plain objects only. */
function structuredCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
