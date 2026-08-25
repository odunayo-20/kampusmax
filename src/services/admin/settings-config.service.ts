import { PlatformSettingsConfig, SettingsSectionKey } from "@/types/admin";
import { apiDelay } from "@/lib/admin/api";
import { createSettingsConfigSeed } from "@/data/admin/settings-config";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/settings)
//
// Mock persistence only: `save` mutates an in-memory copy so the
// UI behaves realistically within a session. Nothing survives a
// reload and no backend call is made.
// ------------------------------------------------------------

export interface AdminSettingsConfigService {
  get(): Promise<PlatformSettingsConfig>;
  /** Persists one section to the in-memory store (mock). */
  save<S extends SettingsSectionKey>(
    section: S,
    value: PlatformSettingsConfig[S]
  ): Promise<PlatformSettingsConfig>;
  resetToDefaults(): Promise<PlatformSettingsConfig>;
}

export function createMockSettingsConfigService(): AdminSettingsConfigService {
  let config = createSettingsConfigSeed();

  return {
    async get() {
      await apiDelay(180);
      return JSON.parse(JSON.stringify(config)) as PlatformSettingsConfig;
    },

    async save(section, value) {
      await apiDelay(300);
      config = {
        ...config,
        [section]: JSON.parse(JSON.stringify(value)),
      };
      return JSON.parse(JSON.stringify(config)) as PlatformSettingsConfig;
    },

    async resetToDefaults() {
      await apiDelay(300);
      config = createSettingsConfigSeed();
      return JSON.parse(JSON.stringify(config)) as PlatformSettingsConfig;
    },
  };
}
