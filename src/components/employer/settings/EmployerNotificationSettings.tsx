"use client";

import { Bell, Gift, Mail, MessageSquare, Package, Settings2, Heart } from "lucide-react";
import {
  SettingsGroup,
  SettingsRow,
  SettingsToggle,
} from "@/components/profile/SettingsGroup";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-employer-settings";
import {
  SettingsSectionHeader,
  SettingsLoading,
  SettingsError,
  SettingsNote,
} from "./EmployerSettingsShared";
import { getFriendlyErrorMessage } from "@/lib/error-messages";

export function EmployerNotificationSettings() {
  const prefsQuery = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  const header = (
    <SettingsSectionHeader
      title="Notifications"
      description="Choose how Kampmax reaches you about activity on your account."
    />
  );

  if (prefsQuery.isPending) {
    return (
      <>
        {header}
        <SettingsLoading label="Loading notification preferences" />
      </>
    );
  }

  if (prefsQuery.isError || !prefsQuery.data) {
    return (
      <>
        {header}
        <SettingsError
          message={getFriendlyErrorMessage(prefsQuery.error)}
          onRetry={() => void prefsQuery.refetch()}
        />
      </>
    );
  }

  const prefs = prefsQuery.data;
  const pending = updatePrefs.isPending;

  return (
    <div className="space-y-5">
      {header}

      <SettingsGroup
        title="Push notifications"
        description="Alerts delivered to your device"
      >
        <SettingsRow
          icon={<Bell className="h-5 w-5" />}
          label="Enable push notifications"
          description="Receive alerts on your device"
          action={
            <SettingsToggle
              enabled={prefs.pushEnabled}
              disabled={pending}
              onToggle={(v) => updatePrefs.mutate({ pushEnabled: v })}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup
        title="Notification types"
        description="Choose what you want to be notified about"
      >
        <SettingsRow
          icon={<MessageSquare className="h-5 w-5" />}
          label="Messages"
          description="New messages in your inbox"
          action={
            <SettingsToggle
              enabled={prefs.messages}
              disabled={pending}
              onToggle={(v) => updatePrefs.mutate({ messages: v })}
            />
          }
        />
        <SettingsRow
          icon={<Package className="h-5 w-5" />}
          label="Order & activity updates"
          description="Status changes and delivery updates"
          action={
            <SettingsToggle
              enabled={prefs.orderUpdates}
              disabled={pending}
              onToggle={(v) => updatePrefs.mutate({ orderUpdates: v })}
            />
          }
        />
        <SettingsRow
          icon={<Heart className="h-5 w-5" />}
          label="Community"
          description="Posts, comments, and campus events"
          action={
            <SettingsToggle
              enabled={prefs.community}
              disabled={pending}
              onToggle={(v) => updatePrefs.mutate({ community: v })}
            />
          }
        />
        <SettingsRow
          icon={<Gift className="h-5 w-5" />}
          label="Promotions"
          description="Deals, discounts, and special offers"
          action={
            <SettingsToggle
              enabled={prefs.promotions}
              disabled={pending}
              onToggle={(v) => updatePrefs.mutate({ promotions: v })}
            />
          }
        />
        <SettingsRow
          icon={<Settings2 className="h-5 w-5" />}
          label="System"
          description="Important updates about your account"
          action={
            <SettingsToggle
              enabled={prefs.system}
              disabled={pending}
              onToggle={(v) => updatePrefs.mutate({ system: v })}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Email delivery">
        <SettingsRow
          icon={<Mail className="h-5 w-5" />}
          label="Weekly email digest"
          description="A weekly summary of activity on your account"
          action={
            <SettingsToggle
              enabled={prefs.emailDigest}
              disabled={pending}
              onToggle={(v) => updatePrefs.mutate({ emailDigest: v })}
            />
          }
        />
      </SettingsGroup>

      <SettingsNote>
        These preferences are shared across your Kampmax account. Updates about
        your jobs, applications and contracts follow these same settings, and
        system notifications contain important account information that may not
        be fully disabled.
      </SettingsNote>
    </div>
  );
}