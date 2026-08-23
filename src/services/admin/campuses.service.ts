import { Campus, CampusStatus } from "@/types/admin";
import { apiDelay, applySearch } from "@/lib/admin/api";

export interface AdminCampusService {
  list(): Promise<Campus[]>;
  getById(id: string): Promise<Campus | null>;
  setStatus(id: string, status: CampusStatus): Promise<Campus>;
}

export function createMockCampusService(seed: Campus[]): AdminCampusService {
  let rows = seed.map((c) => ({ ...c }));

  return {
    async list() {
      await apiDelay();
      return applySearch(rows, undefined, (c) => [c.name, c.shortName]);
    },

    async getById(id) {
      await apiDelay(120);
      return rows.find((c) => c.id === id) ?? null;
    },

    async setStatus(id, status) {
      await apiDelay();
      const idx = rows.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error(`Campus ${id} not found`);
      rows[idx] = { ...rows[idx], status };
      return rows[idx];
    },
  };
}
