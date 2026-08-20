"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Info } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsGroup, SettingsRow, SettingsToggle } from "@/components/profile/SettingsGroup";
import { NotificationPreferences } from "@/types";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/services/profile";

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationPreferences>(getNotificationPreferences);

  function update(key: keyof NotificationPreferences, value: boolean) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    updateNotificationPreferences({ [key]: value });
  }

  return (
    <PageContainer className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Profile", href: "/profile" },
          { label: "Notification Settings" },
        ]}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <h1 className="text-lg font-bold text-kampmax-text">Notification Settings</h1>
      </div>

      {/* Push Notifications */}
      <SettingsGroup title="Push Notifications">
        <SettingsRow
          icon={<Bell className="h-5 w-5" />}
          label="Enable Push Notifications"
          description="Receive alerts on your device"
          action={
            <SettingsToggle
              enabled={prefs.pushEnabled}
              onToggle={(v) => update("pushEnabled", v)}
            />
          }
        />
      </SettingsGroup>

      {/* Notification Types */}
      <SettingsGroup
        title="Notification Types"
        description="Choose what you want to be notified about"
      >
        <SettingsRow
          icon={<span className="text-lg">📦</span>}
          label="Order Updates"
          description="Status changes, delivery updates"
          action={
            <SettingsToggle
              enabled={prefs.orderUpdates}
              onToggle={(v) => update("orderUpdates", v)}
            />
          }
        />
        <SettingsRow
          icon={<span className="text-lg">💬</span>}
          label="Messages"
          description="New messages from vendors"
          action={
            <SettingsToggle
              enabled={prefs.messages}
              onToggle={(v) => update("messages", v)}
            />
          }
        />
        <SettingsRow
          icon={<span className="text-lg">🎉</span>}
          label="Promotions"
          description="Deals, discounts, and special offers"
          action={
            <SettingsToggle
              enabled={prefs.promotions}
              onToggle={(v) => update("promotions", v)}
            />
          }
        />
        <SettingsRow
          icon={<span className="text-lg">👥</span>}
          label="Community"
          description="Posts, comments, and campus events"
          action={
            <SettingsToggle
              enabled={prefs.community}
              onToggle={(v) => update("community", v)}
            />
          }
        />
        <SettingsRow
          icon={<span className="text-lg">⚙️</span>}
          label="System"
          description="Important updates about your account"
          action={
            <SettingsToggle
              enabled={prefs.system}
              onToggle={(v) => update("system", v)}
            />
          }
        />
      </SettingsGroup>

      {/* Email */}
      <SettingsGroup title="Email">
        <SettingsRow
          icon={<span className="text-lg">📧</span>}
          label="Email Digest"
          description="Weekly summary of activity"
          action={
            <SettingsToggle
              enabled={prefs.emailDigest}
              onToggle={(v) => update("emailDigest", v)}
            />
          }
        />
      </SettingsGroup>

      {/* Info */}
      <div className="bg-kampmax-muted/50 rounded-xl p-4 flex items-start gap-2">
        <Info className="h-4 w-4 text-kampmax-text-secondary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-kampmax-text-secondary leading-relaxed">
          Order updates and system notifications cannot be fully disabled as they contain important account information.
        </p>
      </div>
    </PageContainer>
  );
}
