import {
  AdminCategory,
  AdminProduct,
  ListQuery,
  Paginated,
} from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";

// ------------------------------------------------------------
// PRODUCTS
// ------------------------------------------------------------

export interface ProductListFilters {
  status?: AdminProduct["status"] | "all";
  campusId?: string | "all";
  categoryId?: string | "all";
  flaggedOnly?: boolean;
}

export interface ProductListQuery extends ListQuery, ProductListFilters {}

export interface AdminProductService {
  list(query?: ProductListQuery): Promise<Paginated<AdminProduct>>;
  getById(id: string): Promise<AdminProduct | null>;
  moderate(id: string, action: "approve" | "flag" | "remove"): Promise<AdminProduct>;
}

export function createMockProductService(
  seed: AdminProduct[]
): AdminProductService {
  let rows = seed.map((p) => ({ ...p }));

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
        campusId = "all",
        categoryId = "all",
      } = query;

      let filtered = rows.filter(
        (p) =>
          (status === "all" || p.status === status) &&
          (campusId === "all" || p.campusId === campusId) &&
          (categoryId === "all" || p.categoryId === categoryId)
      );

      filtered = applySearch(filtered, search, (p) => [
        p.title,
        p.vendorName,
        p.categoryName,
        p.id,
      ]);

      filtered = applySort(
        filtered,
        sortBy,
        sortDir,
        {
          createdAt: (p) => new Date(p.createdAt).getTime(),
          price: (p) => p.price,
          views: (p) => p.views,
          saves: (p) => p.saves,
          title: (p) => p.title,
        },
        "createdAt"
      );

      return paginate(filtered, { page, pageSize });
    },

    async getById(id) {
      await apiDelay(120);
      return rows.find((p) => p.id === id) ?? null;
    },

    async moderate(id, action) {
      await apiDelay();
      const idx = rows.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error(`Product ${id} not found`);
      const nextStatus =
        action === "approve"
          ? "available"
          : action === "flag"
            ? "flagged"
            : "removed";
      rows[idx] = { ...rows[idx], status: nextStatus };
      return rows[idx];
    },
  };
}

// ------------------------------------------------------------
// CATEGORIES
// ------------------------------------------------------------

export interface AdminCategoryService {
  list(): Promise<AdminCategory[]>;
  getById(id: string): Promise<AdminCategory | null>;
  setStatus(id: string, status: AdminCategory["status"]): Promise<AdminCategory>;
}

export function createMockCategoryService(
  seed: AdminCategory[]
): AdminCategoryService {
  let rows = seed.map((c) => ({ ...c }));

  return {
    async list() {
      await apiDelay();
      return [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
    },

    async getById(id) {
      await apiDelay(120);
      return rows.find((c) => c.id === id) ?? null;
    },

    async setStatus(id, status) {
      await apiDelay();
      const idx = rows.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error(`Category ${id} not found`);
      rows[idx] = { ...rows[idx], status };
      return rows[idx];
    },
  };
}
