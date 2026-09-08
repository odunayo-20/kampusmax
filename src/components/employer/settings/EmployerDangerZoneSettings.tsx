"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  LogOut,
  PauseCircle,
  Trash2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  useDeactivateAccount,
  useDeleteAccount,
} from "@/hooks/use-employer-settings";
import { SettingsGroup, SettingsRow } from "@/components/profile/SettingsGroup";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import {
  SettingsSectionHeader,
  SettingsNote,
} from "./EmployerSettingsShared";

type ConfirmAction = "logout" | "deactivate" | "delete" | null;
type TerminalState = "deactivated" | "deleted" | null;

export function EmployerDangerZoneSettings() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const deactivateMutate = useDeactivateAccount();
  const deleteMutate = useDeleteAccount();

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [terminal, setTerminal] = useState<TerminalState>(null);
  const [deletePanelOpen, setDeletePanelOpen] = useState(false);

  const emailMatches =
    deleteEmail.trim().toLowerCase() === (user?.email ?? "").trim().toLowerCase();

  async function finishSession() {
    await logout();
    queryClient.clear();
  }

  async function handleConfirmLogout() {
    setConfirmAction(null);
    setActionError(null);
    setIsLoggingOut(true);
    await finishSession();
    router.push("/login");
  }

  async function handleConfirmDeactivate() {
    setConfirmAction(null);
    setActionError(null);
    try {
      const result = await deactivateMutate.mutateAsync();
      if (!result.success) {
        setActionError(result.message);
        return;
      }
      await finishSession();
      setTerminal("deactivated");
      router.push("/login");
    } catch (err) {
      setActionError(getFriendlyErrorMessage(err));
    }
  }

  async function handleConfirmDelete() {
    setConfirmAction(null);
    setActionError(null);
    try {
      const result = await deleteMutate.mutateAsync(deleteEmail);
      if (!result.success) {
        setActionError(result.message);
        return;
      }
      await finishSession();
      setTerminal("deleted");
      router.push("/login");
    } catch (err) {
      setActionError(getFriendlyErrorMessage(err));
    }
  }

  if (terminal) {
    return (
      <div className="space-y-5">
        <SettingsSectionHeader
          title="Danger Zone"
          description={terminal === "deactivated" ? "Account deactivated" : "Account deleted"}
        />
        <div className="rounded-xl border border-kampmax-border bg-white p-8 text-center">
          <ShieldCheck
            className="mx-auto h-10 w-10 text-kampmax-text-secondary"
            aria-hidden
          />
          <h2 className="mt-3 text-base font-bold text-kampmax-text">
            {terminal === "deactivated"
              ? "Your account has been deactivated."
              : "Your account has been deleted."}
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-kampmax-text-secondary">
            {terminal === "deactivated"
              ? "You've been signed out and your employer profile is paused. Contact Kampmax support at support@kampmax.com to reactivate."
              : "You've been signed out and your account is gone. Thanks for using Kampmax — you can create a new account anytime."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SettingsSectionHeader
        title="Danger Zone"
        description="Account-ending actions. These are permanent or require support to undo."
      />

      <SettingsGroup
        title="Session"
        description="End the current sign-in."
      >
        <SettingsRow
          icon={<LogOut className="h-5 w-5" />}
          label="Log out of this device"
          description="You'll need to sign in again to reach your employer dashboard"
          onClick={() => {
            setActionError(null);
            setConfirmAction("logout");
          }}
        />
      </SettingsGroup>

      <SettingsGroup
        title="Deactivate account"
        description="Pause your account and employer profile."
      >
        <SettingsRow
          icon={<PauseCircle className="h-5 w-5" />}
          label="Deactivate account"
          description="You'll be signed out and your profile paused. Reactivation requires Kampmax support."
          danger
          onClick={() => {
            setActionError(null);
            setConfirmAction("deactivate");
          }}
        />
      </SettingsGroup>

      <SettingsGroup
        title="Delete account"
        description="Permanently remove your account and data."
      >
        <SettingsRow
          icon={<Trash2 className="h-5 w-5" />}
          label="Delete account permanently"
          description="Removes your account, employer profile, jobs and data. This can't be undone."
          danger
          onClick={() => {
            setActionError(null);
            setDeletePanelOpen((open) => !open);
          }}
        />
        {deletePanelOpen && (
          <div className="space-y-3 border-t border-kampmax-border bg-error-50/40 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-kampmax-error"
                aria-hidden
              />
              <p className="text-xs leading-relaxed text-kampmax-text-secondary">
                Deleting is permanent. To continue, type the account email{" "}
                <span className="font-semibold text-kampmax-text">
                  {user?.email}
                </span>{" "}
                below.
              </p>
            </div>
            <input
              type="text"
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              placeholder="Type your account email"
              aria-label="Type your account email to confirm deletion"
              className="w-full rounded-lg border border-kampmax-error/40 bg-white px-3 py-2.5 text-sm text-kampmax-text focus:border-kampmax-error focus:outline-none focus:ring-1 focus:ring-kampmax-error"
            />
            <button
              type="button"
              disabled={!emailMatches}
              onClick={() => setConfirmAction("delete")}
              className="w-full rounded-lg bg-kampmax-error py-2.5 text-sm font-semibold text-white transition-colors hover:bg-kampmax-error/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to delete
            </button>
          </div>
        )}
      </SettingsGroup>

      {actionError && (
        <p role="alert" className="text-sm font-medium text-kampmax-error">
          {actionError}
        </p>
      )}

      <SettingsNote>
        These actions are intentional. Deactivating or deleting is confirmed
        with Kampmax&apos;s backend before anything changes on your account —
        there is no client-only toggle that fakes these actions.
      </SettingsNote>

      <ConfirmDialog
        open={confirmAction === "logout"}
        title="Log out of this device?"
        body="You'll need to sign in again to reach your employer dashboard."
        confirmLabel="Log out"
        pending={isLoggingOut}
        onConfirm={() => void handleConfirmLogout()}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === "deactivate"}
        title="Deactivate your account?"
        body="Your employer profile will be paused and you'll be signed out. Reactivation requires contacting Kampmax support. Consider how this affects your open jobs and contracts before continuing."
        confirmLabel="Deactivate account"
        destructive
        pending={deactivateMutate.isPending}
        onConfirm={() => void handleConfirmDeactivate()}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === "delete"}
        title="Delete your account permanently?"
        body="This removes your account, employer profile, jobs and data from Kampmax. This can't be undone."
        confirmLabel="Delete permanently"
        destructive
        pending={deleteMutate.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}