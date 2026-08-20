"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Shield, Lock, HelpCircle, LogOut } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsGroup, SettingsRow } from "@/components/profile/SettingsGroup";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <PageContainer className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Profile", href: "/profile" },
          { label: "Settings" },
        ]}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <h1 className="text-lg font-bold text-kampmax-text">Settings</h1>
      </div>

      <SettingsGroup title="Notifications">
        <SettingsRow
          icon={<Bell className="h-5 w-5" />}
          label="Notification Preferences"
          description="Manage push, email, and in-app alerts"
          onClick={() => router.push("/profile/settings/notifications")}
        />
      </SettingsGroup>

      <SettingsGroup title="Privacy & Security">
        <SettingsRow
          icon={<Shield className="h-5 w-5" />}
          label="Privacy Settings"
          description="Control who sees your information"
          onClick={() => router.push("/profile/settings/privacy")}
        />
        <SettingsRow
          icon={<Lock className="h-5 w-5" />}
          label="Security Settings"
          description="Password, 2FA, active sessions"
          onClick={() => router.push("/profile/settings/security")}
        />
      </SettingsGroup>

      <SettingsGroup title="Support">
        <SettingsRow
          icon={<HelpCircle className="h-5 w-5" />}
          label="Help & Support"
          description="FAQ, contact us, report a problem"
          onClick={() => router.push("/profile/help")}
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          icon={<LogOut className="h-5 w-5" />}
          label="Log Out"
          description="Sign out of your account"
          onClick={handleLogout}
          danger
        />
      </SettingsGroup>
    </PageContainer>
  );
}
