"use client";

import Link from "next/link";
import {
  Building2,
  ExternalLink,
  Mail,
  Phone,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  useEmployerAccountSettings,
} from "@/hooks/use-employer-settings";
import { EmployerStatusBadge } from "@/components/employer/EmployerStatusBadge";
import { SettingsGroup, SettingsRow } from "@/components/profile/SettingsGroup";
import {
  SettingsSectionHeader,
  SettingsValueRow,
  SettingsLoading,
  SettingsError,
  SettingsNote,
} from "./EmployerSettingsShared";
import { getFriendlyErrorMessage } from "@/lib/error-messages";

export function EmployerAccountSettings() {
  const { user } = useAuth();
  const accountQuery = useEmployerAccountSettings();

  const header = (
    <SettingsSectionHeader
      title="Account settings"
      description="Your account identity and employer organization."
    />
  );

  if (accountQuery.isPending) {
    return (
      <>
        {header}
        <SettingsLoading label="Loading account settings" />
      </>
    );
  }

  if (accountQuery.isError || !accountQuery.data) {
    return (
      <>
        {header}
        <SettingsError
          message={getFriendlyErrorMessage(accountQuery.error)}
          onRetry={() => void accountQuery.refetch()}
        />
      </>
    );
  }

  const { approval } = accountQuery.data;

  return (
    <div className="space-y-5">
      {header}

      <SettingsGroup
        title="Account identity"
        description="These are the credentials Kampmax verifies when you sign in."
      >
        <SettingsRow
          icon={<UserRound className="h-5 w-5" />}
          label="Full name"
          description={user?.name ?? "—"}
        />
        <SettingsRow
          icon={<Mail className="h-5 w-5" />}
          label="Email address"
          description={user?.email ?? "—"}
        />
        <SettingsRow
          icon={<Phone className="h-5 w-5" />}
          label="Phone number"
          description={user?.phone ?? "—"}
        />
      </SettingsGroup>

      <SettingsNote>
        Account identifiers are shown read-only here. Changing your email or
        phone requires a verified change flow that the backend doesn&apos;t
        expose yet — nothing is updated without that flow.
      </SettingsNote>

      <SettingsGroup
        title="Employer account"
        description="The organization linked to your employer profile on Kampmax."
      >
        <SettingsValueRow label="Organization">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-4 w-4" aria-hidden />
            <span className="font-medium text-kampmax-text">
              {approval.orgName || "—"}
            </span>
          </span>
        </SettingsValueRow>
        <SettingsValueRow label="Status">
          <EmployerStatusBadge
            status={approval.status ?? "DRAFT"}
          />
        </SettingsValueRow>
        <SettingsValueRow label="Verification" note="Determined by Kampmax during review.">
          {approval.verification === "verified" ? "Verified" : "Not verified"}
        </SettingsValueRow>
        <SettingsValueRow label="Campus">
          {approval.campusName || "—"}
        </SettingsValueRow>
        <SettingsValueRow
          label="Public profile"
          note={
            approval.isPublic
              ? "Your employer profile is live."
              : "Your profile becomes public after approval."
          }
        >
          {approval.isPublic && approval.approvedSlug ? (
            <Link
              href={`/employers/${approval.approvedSlug}`}
              className="inline-flex items-center gap-1 font-medium text-kampmax-blue hover:underline"
            >
              View profile
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Not published
            </span>
          )}
        </SettingsValueRow>
      </SettingsGroup>
    </div>
  );
}