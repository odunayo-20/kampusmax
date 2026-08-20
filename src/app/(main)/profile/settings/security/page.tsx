"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Lock, Shield, Key, Smartphone, MonitorSmartphone,
  AlertTriangle, Info, ChevronRight, Check,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsGroup, SettingsRow, SettingsToggle } from "@/components/profile/SettingsGroup";
import { SecuritySettings as SecuritySettingsType } from "@/types";
import {
  getSecuritySettings,
  updateSecuritySettings,
} from "@/services/profile";
import { formatDate } from "@/lib/utils";

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SecuritySettingsType>(getSecuritySettings);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  function toggle2FA() {
    const updated = { ...settings, twoFactorEnabled: !settings.twoFactorEnabled };
    setSettings(updated);
    updateSecuritySettings({ twoFactorEnabled: updated.twoFactorEnabled });
  }

  function toggleLoginNotifs() {
    const updated = { ...settings, loginNotifications: !settings.loginNotifications };
    setSettings(updated);
    updateSecuritySettings({ loginNotifications: updated.loginNotifications });
  }

  function handlePasswordChange() {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) return;
    setPasswordSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordForm(false);
    setTimeout(() => setPasswordSaved(false), 2000);
  }

  return (
    <PageContainer className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Profile", href: "/profile" },
          { label: "Security Settings" },
        ]}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <h1 className="text-lg font-bold text-kampmax-text">Security Settings</h1>
      </div>

      {/* Password */}
      <SettingsGroup title="Password">
        <SettingsRow
          icon={<Key className="h-5 w-5" />}
          label="Change Password"
          description={`Last changed ${formatDate(settings.lastPasswordChange)}`}
          action={<ChevronRight className="h-4 w-4 text-kampmax-text-secondary" />}
          onClick={() => setShowPasswordForm(!showPasswordForm)}
        />
        {showPasswordForm && (
          <div className="p-4 space-y-3 bg-kampmax-muted/30">
            <div>
              <label className="block text-xs font-medium text-kampmax-text-secondary mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-kampmax-text-secondary mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-kampmax-text-secondary mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[11px] text-kampmax-error mt-1">Passwords do not match</p>
              )}
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
              className="w-full py-2.5 rounded-lg bg-kampmax-blue text-white text-sm font-semibold disabled:opacity-40"
            >
              Update Password
            </button>
          </div>
        )}
      </SettingsGroup>

      {/* Two-Factor */}
      <SettingsGroup title="Two-Factor Authentication">
        <SettingsRow
          icon={<Smartphone className="h-5 w-5" />}
          label="Enable 2FA"
          description={settings.twoFactorEnabled ? `Via ${settings.twoFactorMethod.toUpperCase()}` : "Add an extra layer of security"}
          action={
            <SettingsToggle
              enabled={settings.twoFactorEnabled}
              onToggle={toggle2FA}
            />
          }
        />
        {settings.twoFactorEnabled && (
          <SettingsRow
            icon={<span className="text-lg">📱</span>}
            label="Verification Method"
            description={`Using ${settings.twoFactorMethod === "sms" ? "SMS to your phone" : "Email to your address"}`}
            action={
              <select
                value={settings.twoFactorMethod}
                onChange={(e) => {
                  const method = e.target.value as "sms" | "email";
                  setSettings((s) => ({ ...s, twoFactorMethod: method }));
                  updateSecuritySettings({ twoFactorMethod: method });
                }}
                className="px-2 py-1 rounded border border-kampmax-border text-xs bg-white"
              >
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
            }
          />
        )}
      </SettingsGroup>

      {/* Sessions */}
      <SettingsGroup title="Active Sessions">
        <SettingsRow
          icon={<MonitorSmartphone className="h-5 w-5" />}
          label="Active Sessions"
          description={`${settings.activeSessions} device(s) currently logged in`}
          action={<ChevronRight className="h-4 w-4 text-kampmax-text-secondary" />}
          onClick={() => {}}
        />
      </SettingsGroup>

      {/* Login Alerts */}
      <SettingsGroup title="Login Alerts">
        <SettingsRow
          icon={<Shield className="h-5 w-5" />}
          label="Login Notifications"
          description="Get notified when someone logs into your account"
          action={
            <SettingsToggle
              enabled={settings.loginNotifications}
              onToggle={toggleLoginNotifs}
            />
          }
        />
      </SettingsGroup>

      {/* Info */}
      <div className="bg-kampmax-muted/50 rounded-xl p-4 flex items-start gap-2">
        <Info className="h-4 w-4 text-kampmax-text-secondary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-kampmax-text-secondary leading-relaxed">
          If you suspect unauthorized access, change your password immediately and enable two-factor authentication.
        </p>
      </div>

      {/* Password Saved Toast */}
      {passwordSaved && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-kampmax-navy text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg">
          <Check className="h-4 w-4" />
          Password updated
        </div>
      )}
    </PageContainer>
  );
}
