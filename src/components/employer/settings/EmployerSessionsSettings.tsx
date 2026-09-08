"use client";

import Link from "next/link";
import { MonitorSmartphone, ShieldAlert, Info } from "lucide-react";
import {
  SettingsGroup,
  SettingsRow,
} from "@/components/profile/SettingsGroup";
import { useSecuritySettings } from "@/hooks/use-employer-settings";
import {
  SettingsSectionHeader,
  SettingsLoading,
  SettingsError,
  SettingsNote,
} from "./EmployerSettingsShared";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import type { ReactNode } from "react";

function SessionCheckupRow({
  icon,
  label,
  description,
  href,
  linkLabel,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex-shrink-0 text-kampmax-text-secondary">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-kampmax-text">{label}</p>
        <p className="mt-0.5 text-xs text-kampmax-text-secondary">
          {description}
        </p>
      </div>
      <Link
        href={href}
        className="flex-shrink-0 text-sm font-semibold text-kampmax-blue hover:underline"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

export function EmployerSessionsSettings() {
  const secQuery = useSecuritySettings();

  const header = (
    <SettingsSectionHeader
      title="Sessions"
      description="Devices and sign-in activity on your account."
    />
  );

  if (secQuery.isPending) {
    return (
      <>
        {header}
        <SettingsLoading label="Loading session information" />
      </>
    );
  }

  if (secQuery.isError || !secQuery.data) {
    return (
      <>
        {header}
        <SettingsError
          message={getFriendlyErrorMessage(secQuery.error)}
          onRetry={() => void secQuery.refetch()}
        />
      </>
    );
  }

  const sec = secQuery.data;

  return (
    <div className="space-y-5">
      {header}

      <SettingsGroup
        title="Active sessions"
        description="Kampmax tracks how many devices are signed in to your account."
      >
        <SettingsRow
          icon={<MonitorSmartphone className="h-5 w-5" />}
          label="Active sessions"
          description={`${sec.activeSessions} session${sec.activeSessions === 1 ? "" : "s"} currently signed in`}
        />
      </SettingsGroup>

      <SettingsNote>
        Kampmax doesn&apos;t expose per-device session management yet, so there
        is no list of devices or individual revoke actions here. When the
        backend lands session management, you&apos;ll be able to review and end
        sessions in this section — nothing is shown that isn&apos;t real.
      </SettingsNote>

      <SettingsGroup
        title="Security checkup"
        description="Ways to protect your account today"
      >
        <SessionCheckupRow
          icon={<ShieldAlert className="h-5 w-5" />}
          label="Change your password"
          description="Ends risk from any stale sign-in details"
          href="/employer/settings/security"
          linkLabel="Go to Security"
        />
        <SessionCheckupRow
          icon={<Info className="h-5 w-5" />}
          label="Login notifications"
          description="Get an alert whenever someone signs in to your account"
          href="/employer/settings/security"
          linkLabel="Go to Security"
        />
      </SettingsGroup>
    </div>
  );
}