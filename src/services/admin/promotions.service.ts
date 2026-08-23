import { Paginated, Promotion, PromotionStatus } from "@/types/admin";
import { apiDelay, applySearch, paginate } from "@/lib/admin/api";

export interface AdminPromotionService {
  list(query?: {
    search?: string;
    status?: PromotionStatus | "all";
    page?: number;
    pageSize?: number;
  }): Promise<Paginated<Promotion>>;
  setStatus(id: string, status: "active" | "paused" | "ended"): Promise<Promotion>;
}

export function createMockPromotionService(
  seed: Promotion[]
): AdminPromotionService {
  let rows = seed.map((p) => ({ ...p }));

  return {
    async list(query = {}) {
      await apiDelay();
      const { search, status = "all", page = 1, pageSize = 10 } = query;

      let filtered = rows.filter(
        (p) => status === "all" || p.status === status
      );

      filtered = applySearch(filtered, search, (p) => [
        p.title,
        p.code ?? "",
        p.vendorName ?? "",
      ]);

      filtered.sort(
        (a, b) =>
          new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
      );

      return paginate(filtered, { page, pageSize });
    },

    async setStatus(id, status) {
      await apiDelay();
      const idx = rows.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error(`Promotion ${id} not found`);
      rows[idx] = { ...rows[idx], status };
      return rows[idx];
    },
  };
}
