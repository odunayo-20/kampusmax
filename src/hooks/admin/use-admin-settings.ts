"use client";

// ============================================================
// ADMIN PLATFORM SETTINGS HOOKS (Module 50)
// ============================================================
//
// TanStack Query wrappers over the mock settings-config service
// (`/admin/settings` console). Keys are neither user- nor
// campus-scoped: the settings surface is restricted to full
// operators (SUPER_ADMIN/ADMIN) via nav permissions, so there is no
// campus shard. Mutations invalidate the whole `adminKeys.settings`
// tree so the console and any open section form refresh together.
//
// SECURITY NOTE: per-section edit capability is DERIVED from the
// live RBAC matrix (Module 49) in the page layer — this service
// stores the config only. The NestJS backend remains the authority
// for what each permission maps to; the prototype never treats the
// mock service as enforcement.
// ============================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/lib/query-keys";
import { settingsConfigService } from "@/services/admin";
import { createSettingsConfigSeed } from "@/data/admin/settings-config";
import { useAdminSession } from "@/lib/admin/admin-auth-context";
import type { PlatformSettingsConfig, SettingsSectionKey } from "@/types/admin";

function useActor() {
  const { admin } = useAdminSession();
  if (!admin) {
    throw new Error("Admin settings hooks require an authenticated admin session");
  }
  return admin;
}

export function usePlatformSettings() {
  useActor();
  return useQuery({
    queryKey: adminKeys.settings.config(),
    queryFn: () => settingsConfigService.get(),
  });
}

export function useSaveSettingsSection() {
  useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      section,
      value,
    }: {
      section: SettingsSectionKey;
      value: PlatformSettingsConfig[SettingsSectionKey];
    }) => settingsConfigService.save(section, value),
    mutationKey: adminKeys.settings.mutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.settings.all });
    },
  });
}

export function useResetSettingsSection() {
  useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (section: SettingsSectionKey) =>
      settingsConfigService.save(section, createSettingsConfigSeed()[section]),
    mutationKey: adminKeys.settings.mutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.settings.all });
    },
  });
}