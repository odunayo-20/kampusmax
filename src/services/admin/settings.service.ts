import { PlatformSetting } from "@/types/admin";
import { apiDelay } from "@/lib/admin/api";

export interface AdminSettingService {
  listAll(): Promise<PlatformSetting[]>;
  update(key: string, value: PlatformSetting["value"]): Promise<PlatformSetting>;
}

export function createMockSettingService(
  seed: PlatformSetting[]
): AdminSettingService {
  let rows = seed.map((s) => ({ ...s }));

  return {
    async listAll() {
      await apiDelay();
      return rows;
    },

    async update(key, value) {
      await apiDelay(150);
      const idx = rows.findIndex((s) => s.key === key);
      if (idx === -1) throw new Error(`Setting ${key} not found`);
      rows[idx] = { ...rows[idx], value };
      return rows[idx];
    },
  };
}
