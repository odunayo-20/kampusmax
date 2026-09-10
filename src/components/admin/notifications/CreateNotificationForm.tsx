"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Info,
  Loader2,
  Send,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import {
  StatusBadge,
  badgeVariantClasses,
} from "@/components/admin/StatusBadge";
import { cn } from "@/lib/utils";
import {
  AUDIENCE_LABELS,
  AUDIENCE_FILTER_ORDER,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_CATEGORY_LABELS,
} from "./notifications-meta";
import {
  useAdminCreateNotification,
  useAdminAudiencePreview,
} from "@/hooks/admin/use-admin-communications";
import {
  ADMIN_COMPOSABLE_NOTIFICATIONS,
  NOTIFICATION_TITLE_MAX,
  NOTIFICATION_BODY_MAX,
  REAL_CAMPAIGN_CAMPUSES,
} from "@/data/admin/communication-management";
import {
  useAdminSession,
} from "@/lib/admin/admin-auth-context";
import type {
  ManagedAdminNotificationAudience,
  ManagedAdminNotificationCreateInput,
} from "@/types/admin";
import type {
  NotificationType,
  NotificationCategory,
} from "@/types";

interface CreateNotificationFormProps {
  onCreated: () => void;
  onBack: () => void;
}

export function CreateNotificationForm({
  onCreated,
  onBack,
}: CreateNotificationFormProps) {
  const { admin } = useAdminSession();
  const createMutation = useAdminCreateNotification();

  const [type, setType] = useState<NotificationType>(
    ADMIN_COMPOSABLE_NOTIFICATIONS[0].type
  );
  const [category, setCategory] = useState<NotificationCategory>(
    ADMIN_COMPOSABLE_NOTIFICATIONS[0].category
  );
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] =
    useState<ManagedAdminNotificationAudience>("all_users");
  const [campusId, setCampusId] = useState("");
  const [userId, setUserId] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const preview = useAdminAudiencePreview(
    audience,
    audience === "campus" && campusId ? campusId : null,
    audience === "specific_user" && userId ? userId : null
  );

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Title is required.";
    if (title.trim().length > NOTIFICATION_TITLE_MAX)
      next.title = `Max ${NOTIFICATION_TITLE_MAX} characters.`;
    if (!message.trim()) next.message = "Message is required.";
    if (message.trim().length > NOTIFICATION_BODY_MAX)
      next.message = `Max ${NOTIFICATION_BODY_MAX} characters.`;

    const valid = ADMIN_COMPOSABLE_NOTIFICATIONS.some(
      (c) => c.type === type && c.category === category
    );
    if (!valid) next.type = "This type/category pair is not available for admin compose.";

    if (audience === "specific_user" && !userId.trim()) {
      next.userId = "Enter a user ID to target.";
    }
    if (audience === "campus" && !campusId) {
      next.campusId = "Select a campus.";
    }

    if (actionUrl.trim()) {
      const v = actionUrl.trim();
      if (!v.startsWith("/") || v.startsWith("//") || v.includes("\\") || v.slice(1).includes(":")) {
        next.actionUrl = "Must be a safe internal route (e.g. /orders/KMP-4102).";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const input: ManagedAdminNotificationCreateInput = {
      title: title.trim(),
      message: message.trim(),
      type,
      category,
      audience,
      userId: audience === "specific_user" ? userId.trim() || null : null,
      campusId: audience === "campus" ? campusId || null : null,
      actionUrl: actionUrl.trim() || null,
    };
    createMutation.mutate(input, {
      onSuccess: () => onCreated(),
      onError: (err) => {
        setErrors({ submit: err instanceof Error ? err.message : "Dispatch failed." });
      },
    });
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border px-3 py-1.5 text-xs font-medium text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted/40"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      </div>

      <h1 className="mt-3 text-lg font-bold text-kampmax-text">
        Create in-app notification
      </h1>
      <p className="mt-0.5 text-xs text-kampmax-text-secondary">
        Dispatches a real record to the shared in-app notification store
        (Module 26A). No email, SMS or push channel is wired.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-kampmax-border bg-white p-5 space-y-4">
            {/* Type / Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select
                  value={type}
                  onChange={(e) => {
                    const t = e.target.value as NotificationType;
                    setType(t);
                    const match = ADMIN_COMPOSABLE_NOTIFICATIONS.find((c) => c.type === t);
                    if (match) setCategory(match.category);
                  }}
                >
                  {[...new Set(ADMIN_COMPOSABLE_NOTIFICATIONS.map((c) => c.type))].map((t) => (
                    <option key={t} value={t}>
                      {NOTIFICATION_TYPE_LABELS[t]}
                    </option>
                  ))}
                </Select>
                {errors.type && (
                  <p className="mt-1 text-xs text-kampmax-error">{errors.type}</p>
                )}
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NotificationCategory)}
                >
                  {[...new Set(ADMIN_COMPOSABLE_NOTIFICATIONS.map((c) => c.category))].map((c) => (
                    <option key={c} value={c}>
                      {NOTIFICATION_CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label>Title</Label>
              <Input
                value={title}
                placeholder="e.g. New semester promo is live"
                maxLength={NOTIFICATION_TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.title ? (
                  <p className="text-xs text-kampmax-error">{errors.title}</p>
                ) : (
                  <span />
                )}
                <span className="text-[11px] tabular-nums text-kampmax-text-secondary">
                  {title.length}/{NOTIFICATION_TITLE_MAX}
                </span>
              </div>
            </div>

            {/* Message */}
            <div>
              <Label>Message</Label>
              <textarea
                rows={5}
                maxLength={NOTIFICATION_BODY_MAX}
                value={message}
                placeholder="What should recipients know? Keep it short and actionable."
                onChange={(e) => setMessage(e.target.value)}
                className={cn(
                  "w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1",
                  errors.message
                    ? "border-kampmax-error focus:ring-kampmax-error"
                    : "border-kampmax-border focus:ring-kampmax-blue"
                )}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.message ? (
                  <p className="text-xs text-kampmax-error">{errors.message}</p>
                ) : (
                  <span />
                )}
                <span className="text-[11px] tabular-nums text-kampmax-text-secondary">
                  {message.length}/{NOTIFICATION_BODY_MAX}
                </span>
              </div>
            </div>

            {/* Action URL */}
            <div>
              <Label>Action link (optional)</Label>
              <Input
                value={actionUrl}
                placeholder="/orders/KMP-4102"
                onChange={(e) => setActionUrl(e.target.value)}
              />
              {errors.actionUrl && (
                <p className="mt-1 text-xs text-kampmax-error">{errors.actionUrl}</p>
              )}
            </div>
          </div>

          {/* Audience */}
          <div className="rounded-lg border border-kampmax-border bg-white p-5 space-y-4">
            <div>
              <Label>Audience</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {AUDIENCE_FILTER_ORDER.map((a) => (
                  <label
                    key={a}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors",
                      audience === a
                        ? "border-kampmax-blue/40 bg-kampmax-blue/5 text-kampmax-text"
                        : "border-kampmax-border text-kampmax-text-secondary"
                    )}
                  >
                    <input
                      type="radio"
                      name="audience"
                      checked={audience === a}
                      onChange={() => setAudience(a)}
                      className="h-3.5 w-3.5 accent-kampmax-blue"
                    />
                    {AUDIENCE_LABELS[a]}
                  </label>
                ))}
              </div>
            </div>

            {/* Campus ID (campus audience) */}
            {audience === "campus" && (
              <div>
                <Label>Campus</Label>
                <Select
                  value={campusId}
                  onChange={(e) => setCampusId(e.target.value)}
                >
                  <option value="">Select campus…</option>
                  {REAL_CAMPAIGN_CAMPUSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
                {errors.campusId && (
                  <p className="mt-1 text-xs text-kampmax-error">{errors.campusId}</p>
                )}
              </div>
            )}

            {/* User ID (specific_user audience) */}
            {audience === "specific_user" && (
              <div>
                <Label>Recipient user ID</Label>
                <Input
                  value={userId}
                  placeholder="u1"
                  onChange={(e) => setUserId(e.target.value)}
                />
                {errors.userId && (
                  <p className="mt-1 text-xs text-kampmax-error">{errors.userId}</p>
                )}
              </div>
            )}
          </div>

          {/* Submit errors */}
          {errors.submit && (
            <div className="rounded-lg border border-kampmax-error/30 bg-kampmax-error/5 px-4 py-3 text-xs text-kampmax-error">
              {errors.submit}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-9 items-center rounded-md border border-kampmax-border bg-white px-3.5 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={createMutation.isPending}
              onClick={handleSubmit}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-kampmax-blue px-3.5 text-sm font-medium text-white transition-colors hover:bg-kampmax-blue/90 disabled:opacity-60"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Dispatch now
            </button>
          </div>
        </div>

        {/* Sidebar preview */}
        <div className="space-y-4">
          {/* Audience preview */}
          <div className="rounded-lg border border-kampmax-border bg-white p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
              Audience preview
            </h3>
            {preview.isLoading ? (
              <div className="mt-2 h-20 animate-pulse rounded-md bg-kampmax-muted" />
            ) : preview.data ? (
              <div className="mt-2 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-kampmax-text-secondary">Channel</span>
                  <StatusBadge variant="info" label="In-app" dot={false} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-kampmax-text-secondary">Recipients</span>
                  <span className="flex items-center gap-1 font-semibold tabular-nums text-kampmax-text">
                    <Users className="h-3 w-3" />
                    {preview.data.recipients}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-kampmax-text-secondary">Label</span>
                  <span className="font-medium text-kampmax-text">{preview.data.label}</span>
                </div>
                {preview.data.recipients === 0 && (
                  <p className="mt-1 rounded-md border border-kampmax-warning/30 bg-kampmax-warning/5 px-2 py-1.5 text-[11px] text-amber-700">
                    No reachable recipients — you must adjust the audience before dispatching.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-xs text-kampmax-text-secondary">Select an audience above.</p>
            )}
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 rounded-lg border border-kampmax-border bg-kampmax-muted/30 px-4 py-3 text-xs text-kampmax-text-secondary">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Dispatch writes one record per recipient directly to the shared
              notification store. The recipient&apos;s notification bell and
              the user-facing notification center update immediately.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
