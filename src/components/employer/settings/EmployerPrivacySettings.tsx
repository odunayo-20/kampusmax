"use client";

import Link from "next/link";
import { Eye, EyeOff, ExternalLink, MessageCircle, Activity, FileClock } from "lucide-react";
import {
  SettingsGroup,
  SettingsRow,
  SettingsToggle,
} from "@/components/profile/SettingsGroup";
import {
  usePrivacySettings,
  useUpdatePrivacySettings,
  useEmployerAccountSettings,
} from "@/hooks/use-employer-settings";
import {
  SettingsSectionHeader,
  SettingsValueRow,
  SettingsLoading,
  SettingsError,
  SettingsNote,
} from "./EmployerSettingsShared";
import { getFriendlyErrorMessage } from "@/lib/error-messages";

export function EmployerPrivacySettings() {
  const privQuery = usePrivacySettings();
  const accountQuery = useEmployerAccountSettings();
  const updatePriv = useUpdatePrivacySettings();

  const header = (
    <SettingsSectionHeader
      title="Privacy & visibility"
      description="Who can see your information across Kampmax."
    />
  );

  if (privQuery.isPending || accountQuery.isPending) {
    return (
      <>
        {header}
        <SettingsLoading label="Loading privacy settings" />
      </>
    );
  }

  const error = privQuery.error ?? accountQuery.error;
  if (
    (privQuery.isError || accountQuery.isError) ||
    !privQuery.data ||
    !accountQuery.data
  ) {
    return (
      <>
        {header}
        <SettingsError
          message={getFriendlyErrorMessage(error)}
          onRetry={() => {
            void privQuery.refetch();
            void accountQuery.refetch();
          }}
        />
      </>
    );
  }

  const priv = privQuery.data;
  const approval = accountQuery.data.approval;
  const pending = updatePriv.isPending;

  return (
    <div className="space-y-5">
      {header}

      <SettingsGroup
        title="Public employer profile"
        description="How your employer profile is exposed to the jobs marketplace."
      >
        <SettingsValueRow
          label="Public profile"
          note={
            approval.isPublic
              ? "Your profile is live on the marketplace."
              : "Your profile becomes public after Kampmax approval."
          }
        >
          {approval.isPublic && approval.approvedSlug ? (
            <Link
              href={`/employers/${approval.approvedSlug}`}
              className="inline-flex items-center gap-1 font-medium text-kampmax-blue hover:underline"
            >
              Live
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : (
            <span>Not live</span>
          )}
        </SettingsValueRow>
        <SettingsValueRow label="Verification status">
          {approval.verification === "verified" ? "Verified" : "Not verified"}
        </SettingsValueRow>
      </SettingsGroup>

      <SettingsNote>
        Public visibility is controlled by Kampmax review and can&apos;t be
        toggled on or off from settings. Approved and verified employer
        profiles are visible at their public URL; everything else stays
        unpublished.
      </SettingsNote>

      <SettingsGroup
        title="Profile visibility"
        description="Control who can see your personal information"
      >
        <SettingsRow
          icon={<Eye className="h-5 w-5" />}
          label="Show profile to students"
          description="Other students can view your name and details"
          action={
            <SettingsToggle
              enabled={priv.showProfileToStudents}
              disabled={pending}
              onToggle={(v) => updatePriv.mutate({ showProfileToStudents: v })}
            />
          }
        />
        <SettingsRow
          icon={<EyeOff className="h-5 w-5" />}
          label="Show phone number"
          description="Vendors can see your phone for delivery"
          action={
            <SettingsToggle
              enabled={priv.showPhoneToVendors}
              disabled={pending}
              onToggle={(v) => updatePriv.mutate({ showPhoneToVendors: v })}
            />
          }
        />
        <SettingsRow
          icon={<EyeOff className="h-5 w-5" />}
          label="Show email address"
          description="Vendors can see your email address"
          action={
            <SettingsToggle
              enabled={priv.showEmailToVendors}
              disabled={pending}
              onToggle={(v) => updatePriv.mutate({ showEmailToVendors: v })}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup
        title="Communication"
        description="How others can reach you"
      >
        <SettingsRow
          icon={<MessageCircle className="h-5 w-5" />}
          label="Allow direct messages"
          description="Other users can message you directly"
          action={
            <SettingsToggle
              enabled={priv.allowDirectMessages}
              disabled={pending}
              onToggle={(v) => updatePriv.mutate({ allowDirectMessages: v })}
            />
          }
        />
        <SettingsRow
          icon={<Activity className="h-5 w-5" />}
          label="Show online status"
          description="Others can see when you&apos;re online"
          action={
            <SettingsToggle
              enabled={priv.showOnlineStatus}
              disabled={pending}
              onToggle={(v) => updatePriv.mutate({ showOnlineStatus: v })}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Activity">
        <SettingsRow
          icon={<FileClock className="h-5 w-5" />}
          label="Show order history"
          description="Others can see your completed orders on your profile"
          action={
            <SettingsToggle
              enabled={priv.showOrderHistory}
              disabled={pending}
              onToggle={(v) => updatePriv.mutate({ showOrderHistory: v })}
            />
          }
        />
      </SettingsGroup>

      <SettingsNote>
        These privacy preferences are shared across your Kampmax account. Your
        phone and email always reach the people you transact with — these
        controls apply to public visibility only.
      </SettingsNote>
    </div>
  );
}