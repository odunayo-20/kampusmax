import { AdminVendor, ListQuery, Paginated, VendorStatus } from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";

export interface VendorListFilters {
  status?: VendorStatus | "all";
  campusId?: string | "all";
}

export interface VendorListQuery extends ListQuery, VendorListFilters {}

export interface AdminVendorService {
  list(query?: VendorListQuery): Promise<Paginated<AdminVendor>>;
  getById(id: string): Promise<AdminVendor | null>;
  setStatus(id: string, status: Exclude<VendorStatus, "pending">): Promise<AdminVendor>;
}

export function createMockVendorService(seed: AdminVendor[]): AdminVendorService {
  let rows = seed.map((v) => ({ ...v }));

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
      } = query;

      let filtered = rows.filter(
        (v) =>
          (status === "all" || v.status === status) &&
          (campusId === "all" || v.campusId === campusId)
      );

      filtered = applySearch(filtered, search, (v) => [
        v.storeName,
        v.ownerName,
        v.email,
        v.category,
      ]);

      filtered = applySort(
        filtered,
        sortBy,
        sortDir,
        {
          joinedAt: (v) => new Date(v.joinedAt).getTime(),
          totalSales: (v) => v.totalSales,
          rating: (v) => v.rating,
          productsCount: (v) => v.productsCount,
          storeName: (v) => v.storeName,
        },
        "joinedAt"
      );

      return paginate(filtered, { page, pageSize });
    },

    async getById(id) {
      await apiDelay(120);
      return rows.find((v) => v.id === id) ?? null;
    },

    async setStatus(id, status) {
      await apiDelay();
      const idx = rows.findIndex((v) => v.id === id);
      if (idx === -1) throw new Error(`Vendor ${id} not found`);
      rows[idx] = { ...rows[idx], status };
      return rows[idx];
    },
  };
}
