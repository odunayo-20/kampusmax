"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, ShieldPlus, X } from "lucide-react";
import { cn, isValidEmail, isValidPhone } from "@/lib/utils";
import type { CampusAdminInput, ManagedCampus } from "@/types/admin";
import { Input } from "@/components/ui/Input";
import { logoTint } from "./campuses-meta";

interface AssignCampusAdminDialogProps {
  open: boolean;
  campus: ManagedCampus | null;
  saving?: boolean;
  onClose: () => void;
  onAssign: (admin: CampusAdminInput) => Promise<void>;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

const EMPTY_FORM = { name: "", email: "", phone: "" };

export function AssignCampusAdminDialog({
  open,
  campus,
  saving = false,
  onClose,
  onAssign,
}: AssignCampusAdminDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setErrors({});
    setTouched(false);
  }, [open]);

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

  if (!open || !campus) return null;

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (form.name.trim().length < 2) next.name = "Enter the admin's full name.";
    if (!isValidEmail(form.email.trim()))
      next.email = "Enter a valid email address.";
    if (!isValidPhone(form.phone.trim()))
      next.phone = "Enter a valid phone number.";
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    await onAssign({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-admin-title"
    >
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={() => !saving && onClose()}
      />

      <form
        noValidate
        onSubmit={handleSubmit}
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-kampmax-border bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-kampmax-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                logoTint(campus.id)
              )}
            >
              <ShieldPlus className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 id="assign-admin-title" className="text-sm font-semibold text-kampmax-text">
                Assign campus admin
              </h2>
              <p className="text-xs text-kampmax-text-secondary">{campus.name}</p>
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
        <div className="space-y-3 px-5 py-4">
          <p className="rounded-md bg-kampmax-muted/60 px-3 py-2 text-xs leading-relaxed text-kampmax-text-secondary">
            The new admin receives an invite and can manage orders, vendors and
            disputes for this campus only after accepting.
          </p>
          <Input
            label="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={touched ? errors.name : undefined}
            autoComplete="off"
          />
          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={touched ? errors.email : undefined}
            hint="Invites bounce to this address - double-check the spelling."
            autoComplete="off"
          />
          <Input
            label="Phone number"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            error={touched ? errors.phone : undefined}
            autoComplete="off"
          />
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
            disabled={saving}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md bg-kampmax-blue px-4 text-sm font-medium text-white transition-colors hover:bg-kampmax-blue-dark",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Sending invite…" : "Send invite"}
          </button>
        </div>
      </form>
    </div>
  );
}
