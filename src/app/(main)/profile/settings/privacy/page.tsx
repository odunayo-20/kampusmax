"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Info } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsGroup, SettingsRow, SettingsToggle } from "@/components/profile/SettingsGroup";
import { PrivacySettings } from "@/types";
import {
  getPrivacySettings,
  updatePrivacySettings,
} from "@/services/profile";

export default function PrivacySettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<PrivacySettings>(getPrivacySettings);

  function update(key: keyof PrivacySettings, value: boolean) {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    updatePrivacySettings({ [key]: value });
  }

  return (
    <PageContainer className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Profile", href: "/profile" },
          { label: "Privacy Settings" },
        ]}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <h1 className="text-lg font-bold text-kampmax-text">Privacy Settings</h1>
      </div>

      {/* Profile Visibility */}
      <SettingsGroup
        title="Profile Visibility"
        description="Control who can see your information"
      >
        <SettingsRow
          icon={<Eye className="h-5 w-5" />}
          label="Show Profile to Students"
          description="Other students can view your name and department"
          action={
            <SettingsToggle
              enabled={settings.showProfileToStudents}
              onToggle={(v) => update("showProfileToStudents", v)}
            />
          }
        />
        <SettingsRow
          icon={<Eye className="h-5 w-5" />}
          label="Show Phone to Vendors"
          description="Vendors can see your phone for delivery"
          action={
            <SettingsToggle
              enabled={settings.showPhoneToVendors}
              onToggle={(v) => update("showPhoneToVendors", v)}
            />
          }
        />
        <SettingsRow
          icon={<Eye className="h-5 w-5" />}
          label="Show Email to Vendors"
          description="Vendors can see your email address"
          action={
            <SettingsToggle
              enabled={settings.showEmailToVendors}
              onToggle={(v) => update("showEmailToVendors", v)}
            />
          }
        />
      </SettingsGroup>

      {/* Communication */}
      <SettingsGroup
        title="Communication"
        description="Control how others can reach you"
      >
        <SettingsRow
          icon={<span className="text-lg">💬</span>}
          label="Allow Direct Messages"
          description="Other users can message you directly"
          action={
            <SettingsToggle
              enabled={settings.allowDirectMessages}
              onToggle={(v) => update("allowDirectMessages", v)}
            />
          }
        />
        <SettingsRow
          icon={<span className="text-lg">🟢</span>}
          label="Show Online Status"
          description="Others can see when you're online"
          action={
            <SettingsToggle
              enabled={settings.showOnlineStatus}
              onToggle={(v) => update("showOnlineStatus", v)}
            />
          }
        />
      </SettingsGroup>

      {/* Activity */}
      <SettingsGroup title="Activity">
        <SettingsRow
          icon={<span className="text-lg">📋</span>}
          label="Show Order History"
          description="Other students can see your completed orders on your profile"
          action={
            <SettingsToggle
              enabled={settings.showOrderHistory}
              onToggle={(v) => update("showOrderHistory", v)}
            />
          }
        />
      </SettingsGroup>

      {/* Info */}
      <div className="bg-kampmax-muted/50 rounded-xl p-4 flex items-start gap-2">
        <Info className="h-4 w-4 text-kampmax-text-secondary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-kampmax-text-secondary leading-relaxed">
          Your phone and email are always shared with vendors for order delivery purposes, regardless of these settings. These controls apply to public visibility only.
        </p>
      </div>
    </PageContainer>
  );
}
