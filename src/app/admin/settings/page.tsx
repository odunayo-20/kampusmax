"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { ErrorState } from "@/components/admin/ErrorState";
import { cn } from "@/lib/utils";
import {
  SETTINGS_SECTIONS,
} from "@/components/admin/settings/settings-meta";
import {
  FinancialSectionForm,
  GeneralSectionForm,
  LoyaltySectionForm,
  MarketplaceSectionForm,
  NotificationsSectionForm,
  OrdersSectionForm,
  SecuritySectionForm,
} from "@/components/admin/settings/section-forms";
import { settingsConfigService } from "@/services/admin";
import { createSettingsConfigSeed } from "@/data/admin/settings-config";
import type {
  PlatformSettingsConfig,
  SettingsSectionKey,
} from "@/types/admin";

export default function AdminSettingsPage() {
  return <SettingsConsole />;
}

interface ToastMessage {
  id: number;
  tone: "success" | "error";
  text: string;
}

function SettingsConsole() {
  const [section, setSection] = useState<SettingsSectionKey>("general");
  const [config, setConfig] = useState<PlatformSettingsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [savingSection, setSavingSection] = useState<SettingsSectionKey | null>(
    null
  );

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);

  function pushToast(tone: ToastMessage["tone"], text: string) {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setConfig(await settingsConfigService.get());
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Saves one section; returns success so forms can keep/clear errors. */
  const saveSection = useCallback(
    async <S extends SettingsSectionKey>(
      key: S,
      value: PlatformSettingsConfig[S]
    ): Promise<boolean> => {
      setSavingSection(key);
      try {
        setConfig(await settingsConfigService.save(key, value));
        pushToast(
          "success",
          `${SETTINGS_SECTIONS.find((s) => s.key === key)?.label ?? "Section"} settings saved (local mock - not persisted).`
        );
        return true;
      } catch {
        pushToast("error", "Couldn't save this section. Try again.");
        return false;
      } finally {
        setSavingSection(null);
      }
    },
    []
  );

  const resetSection = useCallback(
    async (key: SettingsSectionKey) => {
      try {
        // Reset pulls defaults for this section only; other sections
        // keep their current in-memory values.
        const defaults = createSettingsConfigSeed();
        await settingsConfigService.save(key, defaults[key]);
        setConfig(await settingsConfigService.get());
        pushToast("success", `Section reset to defaults (local mock).`);
      } catch {
        pushToast("error", "Couldn't reset this section.");
      }
    },
    []
  );

  const activeDef = SETTINGS_SECTIONS.find((s) => s.key === section)!;

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Platform configuration across identity, commerce, finance and security. Values are mock/local only."
      />

      {loading ? (
        <LoadingSkeleton variant="detail" rows={8} />
      ) : error || !config ? (
        <ErrorState onRetry={() => void load()} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Section nav */}
          <nav
            aria-label="Settings sections"
            className="flex gap-1 overflow-x-auto rounded-lg border border-kampmax-border bg-white p-1 no-scrollbar lg:h-fit lg:flex-col lg:p-1.5"
          >
            {SETTINGS_SECTIONS.map((def) => {
              const Icon = def.icon;
              const active = section === def.key;
              return (
                <button
                  key={def.key}
                  type="button"
                  onClick={() => setSection(def.key)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-kampmax-navy text-white shadow-sm"
                      : "text-kampmax-text-secondary hover:bg-kampmax-muted/60 hover:text-kampmax-text"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {def.label}
                </button>
              );
            })}
          </nav>

          {/* Active section form */}
          <section
            aria-label={`${activeDef.label} settings`}
            className="rounded-lg border border-kampmax-border bg-white p-5"
          >
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-kampmax-text-secondary">
                Settings
              </p>
              <h1 className="mt-0.5 text-base font-bold text-kampmax-text">
                {activeDef.label}
              </h1>
              <p className="mt-0.5 text-xs text-kampmax-text-secondary">
                {activeDef.description}
              </p>
            </div>

            {savingSection && (
              <p className="mb-4 flex items-center gap-1.5 rounded-md bg-kampmax-muted/50 px-3 py-2 text-xs text-kampmax-text-secondary">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving…
              </p>
            )}

            {section === "general" && (
              <GeneralSectionForm
                value={config.general}
                onSave={(v) => saveSection("general", v)}
                onReset={() => void resetSection("general")}
              />
            )}
            {section === "marketplace" && (
              <MarketplaceSectionForm
                value={config.marketplace}
                onSave={(v) => saveSection("marketplace", v)}
                onReset={() => void resetSection("marketplace")}
              />
            )}
            {section === "orders" && (
              <OrdersSectionForm
                value={config.orders}
                onSave={(v) => saveSection("orders", v)}
                onReset={() => void resetSection("orders")}
              />
            )}
            {section === "financial" && (
              <FinancialSectionForm
                value={config.financial}
                onSave={(v) => saveSection("financial", v)}
                onReset={() => void resetSection("financial")}
              />
            )}
            {section === "loyalty" && (
              <LoyaltySectionForm
                value={config.loyalty}
                onSave={(v) => saveSection("loyalty", v)}
                onReset={() => void resetSection("loyalty")}
              />
            )}
            {section === "notifications" && (
              <NotificationsSectionForm
                value={config.notifications}
                onSave={(v) => saveSection("notifications", v)}
                onReset={() => void resetSection("notifications")}
              />
            )}
            {section === "security" && (
              <SecuritySectionForm
                value={config.security}
                onSave={(v) => saveSection("security", v)}
                onReset={() => void resetSection("security")}
              />
            )}

            <p className="mt-5 flex items-start gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50/60 px-3 py-2.5 text-[11px] leading-snug text-amber-800">
              <ShieldAlert className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
              No backend persistence: every value lives in local state and
              resets when the prototype reloads.
            </p>
          </section>
        </div>
      )}

      {/* Toasts */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex max-w-sm items-start gap-2 rounded-lg border border-kampmax-border bg-white px-3.5 py-2.5 text-sm shadow-lg animate-[kampmax-fade-in_.18s_ease-out]"
          >
            {t.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-kampmax-success" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-kampmax-error" />
            )}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}
