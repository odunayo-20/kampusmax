"use client";

import { useState } from "react";
import { AlertCircle, Check, Save, User } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import { getSpSettings, updateSpSettings } from "@/services/service-provider-dashboard";
import type { ServiceProviderSettings } from "@/types/service-provider-dashboard";

const BookingPrefLabels: Record<string, string> = {
  instant: "Instant booking",
  request_approval: "Request approval",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<ServiceProviderSettings>(() => getSpSettings());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    const res = updateSpSettings(settings);
    if (res.ok) {
      setSettings(res.settings);
      setSaved(true);
    } else {
      setError(res.error ?? "Unable to save settings.");
      setSaved(false);
    }
  }

  function patch<K extends keyof ServiceProviderSettings>(key: K, value: ServiceProviderSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  function patchNested<
    K extends keyof ServiceProviderSettings,
    N extends keyof ServiceProviderSettings[K]
  >(key: K, nested: N, value: ServiceProviderSettings[K][N]) {
    setSettings((s) => {
      const current = s[key] as Record<string, unknown>;
      return { ...s, [key]: { ...current, [nested]: value } };
    });
    setSaved(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-kampmax-text">Settings</h1>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          Account-level provider settings: notifications, bookings, and contact preferences.
        </p>
      </div>

      {(saved || error) && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ring-1 ring-inset",
            error ? "bg-error-50 text-error-700 ring-error-200" : "bg-success-50 text-success-700 ring-success-200"
          )}
          role="status"
        >
          {error ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
          {error ?? "Settings saved."}
        </div>
      )}

      {/* Account link */}
      <div className="rounded-xl border border-kampmax-border bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-kampmax-text">
            <User className="h-4 w-4 text-primary-600" aria-hidden /> Global account
          </h2>
          <a href="/profile" className="text-xs font-medium text-primary-600 hover:underline">
            Manage in account
          </a>
        </div>
        <p className="mt-2 text-sm text-kampmax-text-secondary">
          Email, password, and two-factor settings live in your Kampmax account — not here.
        </p>
      </div>

      {/* Profile visibility */}
      <SettingsSection title="Profile visibility">
        <RadioGroup
          options={[
            { value: "public", label: "Public", description: "Customers can find and book you" },
            { value: "hidden", label: "Hidden", description: "Your profile is temporarily hidden from search" },
          ]}
          value={settings.profileVisibility}
          onChange={(v) => patch("profileVisibility", v as ServiceProviderSettings["profileVisibility"])}
        />
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notification preferences">
        <Toggle
          label="New review alerts"
          checked={settings.notificationPreferences.newReviewAlerts}
          onChange={(v) => patchNested("notificationPreferences", "newReviewAlerts", v)}
        />
        <Toggle
          label="Booking request alerts"
          checked={settings.notificationPreferences.bookingRequestAlerts}
          onChange={(v) => patchNested("notificationPreferences", "bookingRequestAlerts", v)}
        />
        <Toggle
          label="System announcements"
          checked={settings.notificationPreferences.systemAnnouncements}
          onChange={(v) => patchNested("notificationPreferences", "systemAnnouncements", v)}
        />
      </SettingsSection>

      {/* Booking preferences */}
      <SettingsSection title="Booking preferences">
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-kampmax-text">Booking preference</label>
          <Select
            value={settings.bookingPreferences.bookingPreference}
            onChange={(e) => patchNested("bookingPreferences", "bookingPreference", e.target.value as "instant" | "request_approval")}
          >
            <option value="instant">{BookingPrefLabels.instant}</option>
            <option value="request_approval">{BookingPrefLabels.request_approval}</option>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Min advance notice (hours)"
            type="number"
            min={0}
            value={settings.bookingPreferences.minAdvanceNoticeHours}
            onChange={(v) => patchNested("bookingPreferences", "minAdvanceNoticeHours", v)}
          />
          <Field
            label="Max advance days"
            type="number"
            min={1}
            value={settings.bookingPreferences.maxAdvanceBookingDays}
            onChange={(v) => patchNested("bookingPreferences", "maxAdvanceBookingDays", v)}
          />
          <Field
            label="Buffer between bookings (minutes)"
            type="number"
            min={0}
            value={settings.bookingPreferences.appointmentBufferMinutes}
            onChange={(v) => patchNested("bookingPreferences", "appointmentBufferMinutes", v)}
          />
        </div>
      </SettingsSection>

      {/* Contact preferences */}
      <SettingsSection title="Contact preferences">
        <Toggle
          label="Allow calls"
          checked={settings.contactPreferences.allowCalls}
          onChange={(v) => patchNested("contactPreferences", "allowCalls", v)}
        />
        <Toggle
          label="Allow messages"
          checked={settings.contactPreferences.allowMessages}
          onChange={(v) => patchNested("contactPreferences", "allowMessages", v)}
        />
        <Toggle
          label="Allow email"
          checked={settings.contactPreferences.allowEmail}
          onChange={(v) => patchNested("contactPreferences", "allowEmail", v)}
        />
      </SettingsSection>

      {/* Service area preferences */}
      <SettingsSection title="Service area preferences">
        <Toggle
          label="Auto-accept requests within primary campus"
          checked={settings.serviceAreaPreferences.autoAcceptWithinPrimaryCampus}
          onChange={(v) => patchNested("serviceAreaPreferences", "autoAcceptWithinPrimaryCampus", v)}
        />
        <Toggle
          label="Notify me of new out-of-area requests"
          checked={settings.serviceAreaPreferences.notifyNewOutOfAreaRequests}
          onChange={(v) => patchNested("serviceAreaPreferences", "notifyNewOutOfAreaRequests", v)}
        />
      </SettingsSection>

      <div className="flex justify-end border-t border-kampmax-border pt-4">
        <Button onClick={save}>
          <Save className="h-4 w-4 mr-1.5" />
          Save settings
        </Button>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-5">
      <h2 className="mb-4 text-sm font-bold text-kampmax-text">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-sm text-kampmax-text">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
          checked ? "bg-primary-600" : "bg-neutral-300"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
          aria-hidden
        />
      </button>
    </label>
  );
}

function Field({
  label,
  type,
  min,
  value,
  onChange,
}: {
  label: string;
  type: string;
  min?: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-kampmax-text">{label}</label>
      <Input
        type={type}
        min={min}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        inputMode="numeric"
      />
    </div>
  );
}

function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; description: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg border p-3 text-left transition-colors",
            value === opt.value ? "border-primary-600 bg-primary-50" : "border-kampmax-border hover:border-primary-300"
          )}
        >
          <p className="text-sm font-semibold text-kampmax-text">{opt.label}</p>
          <p className="text-xs text-kampmax-text-secondary">{opt.description}</p>
        </button>
      ))}
    </div>
  );
}