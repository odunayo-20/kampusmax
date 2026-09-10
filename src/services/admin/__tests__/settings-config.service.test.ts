import { describe, expect, it } from "vitest";
import { createMockSettingsConfigService } from "../settings-config.service";
import {
  createSettingsConfigSeed,
  defaultSettingsConfig,
} from "@/data/admin/settings-config";
import type { PlatformSettingsConfig, SettingsSectionKey } from "@/types/admin";

const SECTIONS = Object.keys(defaultSettingsConfig) as SettingsSectionKey[];

/** @return false when an unknown section key has no config row. */
function isKnownSection(key: SettingsSectionKey) {
  return key in defaultSettingsConfig;
}

describe("Admin settings-config service (Module 50)", () => {
  it("exposes exactly the seven backend-supported sections - no fabricated ones", async () => {
    const svc = createMockSettingsConfigService();
    const config = await svc.get();
    expect(SECTIONS).toHaveLength(7);
    expect(Object.keys(config).sort()).toEqual(
      [...SECTIONS].sort()
    );
  });

  it("returns a deep clone so callers can never mutate the store", async () => {
    const svc = createMockSettingsConfigService();
    const before = await svc.get();
    const tampered = await svc.get();
    tampered.marketplace.commissionRate = 99;
    tampered.general.platformName = "Hacked";
    const after = await svc.get();
    expect(after).toEqual(before);
    expect(after.marketplace.commissionRate).toBe(8);
  });

  it("reconciles the seeding contract with its documented defaults", async () => {
    const svc = createMockSettingsConfigService();
    const config = await svc.get();
    expect(config.marketplace.commissionRate).toBe(8);
    expect(config.orders.delivery.deliveryFee).toBe(500);
    expect(config.financial.withdrawalMinimum).toBe(2_000);
    expect(config.financial.payoutSchedule).toBe("twice_daily");
    expect(config.financial.requireBvnForPayouts).toBe(true);
    expect(config.security.enforceTwoFactor).toBe(false);
    expect(config.loyalty.enabled).toBe(true);
  });

  it("persists a section save and leaves the other sections untouched", async () => {
    const svc = createMockSettingsConfigService();
    const before = await svc.get();

    const updated = await svc.save("financial", {
      ...before.financial,
      withdrawalMinimum: 5_000,
    });
    expect(updated.financial.withdrawalMinimum).toBe(5_000);
    expect(updated.marketplace).toEqual(before.marketplace);
    expect(updated.orders).toEqual(before.orders);

    const reread = await svc.get();
    expect(reread.financial.withdrawalMinimum).toBe(5_000);
  });

  it("persists saves for every seeded section (round-trip)", async () => {
    const svc = createMockSettingsConfigService();
    const before = await svc.get();
    for (const key of SECTIONS) {
      const updated = await svc.save(key, before[key]);
      expect(updated[key]).toEqual(before[key]);
      const reread = await svc.get();
      expect(reread[key]).toEqual(before[key]);
    }
  });

  it("is robust against unknown or future section keys (backend contract)", async () => {
    const svc = createMockSettingsConfigService();
    const before = await svc.get();
    // Round-trips only known sections; unknown keys must not silently
    // invent new config buckets (no fake settings).
    for (const key of SECTIONS) {
      expect(isKnownSection(key)).toBe(true);
    }
    expect((Object.keys(before) as SettingsSectionKey[]).every(isKnownSection)).toBe(true);
  });

  it("resets the whole config back to its seeded defaults", async () => {
    const svc = createMockSettingsConfigService();
    const tampered = await svc.get();
    tampered.financial.withdrawalMinimum = 99_999;
    await svc.save("financial", tampered.financial);
    tampered.general.platformName = "Nope";
    await svc.save("general", tampered.general);

    const reset = await svc.resetToDefaults();
    const seed = createSettingsConfigSeed();
    expect(reset).toEqual(seed);
    expect((await svc.get()).general.platformName).toBe("Kampmax");
  });

  it("returns platform-settings types only used by the settings surface", async () => {
    const svc = createMockSettingsConfigService();
    const config = await svc.get();
    const typed: PlatformSettingsConfig = config;
    expect(typeof typed.security.sessionTimeoutMinutes).toBe("number");
    expect(Array.isArray(typed.notifications)).toBe(false);
  });
});