"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import { cn, isValidEmail, isValidPhone } from "@/lib/utils";
import type {
  ManagedUser,
  ManagedUserRole,
  ManagedUserUpdateInput,
} from "@/types/admin";
import { Input } from "@/components/ui/Input";
import { UserAvatar } from "./UserBadges";
import { USER_ROLE_LABELS } from "./users-meta";

interface EditUserDialogProps {
  open: boolean;
  user: ManagedUser | null;
  campuses: { id: string; label: string }[];
  saving?: boolean;
  onClose: () => void;
  onSave: (patch: ManagedUserUpdateInput) => Promise<void>;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export function EditUserDialog({
  open,
  user,
  campuses,
  saving = false,
  onClose,
  onSave,
}: EditUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<ManagedUserRole>("customer");
  const [campusId, setCampusId] = useState("all");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setRole(user.role);
    setCampusId(user.campusId);
    setErrors({});
    setTouched(false);
  }, [open, user]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, saving, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const dirty = useMemo(() => {
    if (!user) return false;
    return (
      name !== user.name ||
      email !== user.email ||
      phone !== user.phone ||
      role !== user.role ||
      campusId !== user.campusId
    );
  }, [user, name, email, phone, role, campusId]);

  if (!open || !user) return null;

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (name.trim().length < 2) next.name = "Enter the user's full name.";
    if (!isValidEmail(email.trim())) next.email = "Enter a valid email address.";
    if (!isValidPhone(phone.trim())) next.phone = "Enter a valid phone number.";
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    await onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      campusId,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-user-title"
    >
      <button
        type="button"
        aria-label="Close editor"
        tabIndex={-1}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={() => !saving && onClose()}
      />

      <form
        noValidate
        onSubmit={handleSubmit}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-kampmax-border bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-kampmax-border px-5 py-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="lg" />
            <div>
              <h2 id="edit-user-title" className="text-sm font-semibold text-kampmax-text">
                Edit user
              </h2>
              <p className="font-mono text-[11px] text-kampmax-text-secondary">{user.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            disabled={saving}
            className="rounded-md p-1 text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted hover:text-kampmax-text disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 gap-3 overflow-y-auto px-5 py-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={touched ? errors.name : undefined}
              autoComplete="off"
            />
          </div>
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={touched ? errors.email : undefined}
            autoComplete="off"
          />
          <Input
            label="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={touched ? errors.phone : undefined}
            autoComplete="off"
          />

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-kampmax-text">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as ManagedUserRole)}
              className="h-11 w-full rounded-lg border border-kampmax-border bg-white px-3 text-sm text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
            >
              {(Object.keys(USER_ROLE_LABELS) as ManagedUserRole[]).map((r) => (
                <option key={r} value={r}>
                  {USER_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            {role !== user.role && (
              <p className="mt-1 text-xs text-kampmax-warning">
                Changing roles takes effect immediately.
              </p>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-kampmax-text">Campus</span>
            <select
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              className="h-11 w-full rounded-lg border border-kampmax-border bg-white px-3 text-sm text-kampmax-text focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-kampmax-border bg-kampmax-bg/60 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-9 items-center rounded-md border border-kampmax-border bg-white px-3.5 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || (touched && !dirty && Object.keys(errors).length === 0)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md bg-kampmax-blue px-4 text-sm font-medium text-white transition-colors hover:bg-kampmax-blue-dark",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
