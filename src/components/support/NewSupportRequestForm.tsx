"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LifeBuoy, Send } from "lucide-react";
import { useCreateSupportTicket } from "@/hooks/use-support";
import {
  SUPPORT_CATEGORY_OPTIONS,
  SUPPORT_SECURITY_NOTICE,
} from "@/config/support";
import { AttachmentPicker } from "./AttachmentPicker";
import { cn } from "@/lib/utils";
import type {
  SupportAttachment,
  SupportCustomerRelatedInput,
  SupportTicketCategory,
} from "@/types/admin";

export interface RelatedOption {
  kind: "order" | "transaction";
  id: string;
  label: string;
}

interface NewSupportRequestFormProps {
  user: { id: string };
  relatedOptions: RelatedOption[];
  initialCategory?: SupportTicketCategory | null;
  initialSubject?: string | null;
  prefill: { kind: "order" | "transaction"; id: string } | null;
}

/**
 * New support request form. The backend (store) enforces ownership of any
 * attached order/transaction and forces `priority = "normal"` — the form
 * never exposes status, priority, assignment or escalation, and cannot lie
 * about which account the ticket belongs to.
 */
export function NewSupportRequestForm({
  user,
  relatedOptions,
  initialCategory = null,
  initialSubject = null,
  prefill,
}: NewSupportRequestFormProps) {
  const router = useRouter();
  const create = useCreateSupportTicket();

  const [category, setCategory] = useState<SupportTicketCategory | null>(
    initialCategory && SUPPORT_CATEGORY_OPTIONS.some((c) => c.value === initialCategory)
      ? initialCategory
      : null
  );
  const [subject, setSubject] = useState(initialSubject ?? "");
  const [description, setDescription] = useState("");
  const [relatedValue, setRelatedValue] = useState<string>(
    prefill ? `${prefill.kind}:${prefill.id}` : ""
  );
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedRelated = useMemo(() => {
    if (!relatedValue) return prefill ?? ("none" as const);
    const [kind, id] = relatedValue.split(":");
    return { kind: kind as "order" | "transaction", id };
  }, [relatedValue, prefill]);

  const categoryOptions = SUPPORT_CATEGORY_OPTIONS;

  function onSubmit() {
    setFormError(null);
    if (!category) {
      setFormError("Please pick a category for your request.");
      return;
    }
    if (!subject.trim()) {
      setFormError("Please add a short subject for your request.");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setFormError(
        "Please describe the problem in a little more detail (at least 10 characters)."
      );
      return;
    }

    const related: SupportCustomerRelatedInput | null =
      selectedRelated === "none" || selectedRelated === null
        ? null
        : { kind: selectedRelated.kind, id: selectedRelated.id };

    create.mutate(
      {
        category,
        subject: subject.trim(),
        description: description.trim(),
        related,
        attachments,
      },
      {
        onSuccess: (detail) => {
          router.push(`/support/${detail.ticket.id}`);
        },
        onError: (err) => {
          setFormError(
            err instanceof Error ? err.message : "Could not open your request."
          );
        },
      }
    );
  }

  return (
    <div className="space-y-5 rounded-xl border border-kampmax-border bg-white p-4 sm:p-6">
      {/* Category */}
      <div>
        <h2 className="text-sm font-semibold text-kampmax-text">
          What do you need help with?
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {categoryOptions.map((option) => {
            const active = category === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategory(option.value)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  active
                    ? "border-kampmax-blue bg-kampmax-blue/5 ring-1 ring-kampmax-blue/20"
                    : "border-kampmax-border hover:border-kampmax-blue/40"
                )}
              >
                <p
                  className={cn(
                    "text-xs font-semibold",
                    active ? "text-kampmax-blue" : "text-kampmax-text"
                  )}
                >
                  {option.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-kampmax-text-secondary">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="support-subject" className="mb-1.5 block text-xs font-medium text-kampmax-text">
          Subject <span className="text-kampmax-error">*</span>
        </label>
        <input
          id="support-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={120}
          placeholder="Short summary, e.g. Payment was deducted twice"
          className="w-full rounded-xl border border-kampmax-border px-3 py-2.5 text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/50 focus:border-kampmax-blue focus:outline-none focus:ring-1 focus:ring-kampmax-blue/20"
        />
        <p className="mt-1 text-right text-[11px] text-kampmax-text-secondary">
          {subject.length}/120
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="support-description" className="mb-1.5 block text-xs font-medium text-kampmax-text">
          Description <span className="text-kampmax-error">*</span>
        </label>
        <textarea
          id="support-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Tell us what happened, step by step. Include order numbers or references if relevant."
          className="w-full rounded-xl border border-kampmax-border px-3 py-2.5 text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/50 focus:border-kampmax-blue focus:outline-none focus:ring-1 focus:ring-kampmax-blue/20"
        />
      </div>

      {/* Related resource */}
      <div>
        <label htmlFor="support-related" className="mb-1.5 block text-xs font-medium text-kampmax-text">
          Related order or transaction <span className="text-kampmax-text-secondary">(optional)</span>
        </label>
        <select
          id="support-related"
          value={selectedRelated === "none" ? "" : `${selectedRelated.kind}:${selectedRelated.id}`}
          onChange={(e) => setRelatedValue(e.target.value)}
          className="w-full rounded-xl border border-kampmax-border px-3 py-2.5 text-sm text-kampmax-text focus:border-kampmax-blue focus:outline-none focus:ring-1 focus:ring-kampmax-blue/20"
        >
          <option value="">No specific order or transaction</option>
          {relatedOptions.length > 0 && (
            <optgroup label="My orders">
              {relatedOptions
                .filter((o) => o.kind === "order")
                .map((o) => (
                  <option key={`order:${o.id}`} value={`order:${o.id}`}>
                    {o.label}
                  </option>
                ))}
            </optgroup>
          )}
          {relatedOptions.length > 0 && (
            <optgroup label="My transactions">
              {relatedOptions
                .filter((o) => o.kind === "transaction")
                .map((o) => (
                  <option key={`transaction:${o.id}`} value={`transaction:${o.id}`}>
                    {o.label}
                  </option>
                ))}
            </optgroup>
          )}
        </select>
        <p className="mt-1 text-[11px] text-kampmax-text-secondary">
          Only options that belong to your account are listed. The support team
          re-verifies anything you attach.
        </p>
      </div>

      {/* Attachments */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-kampmax-text">
          Attachments <span className="text-kampmax-text-secondary">(optional)</span>
        </label>
        <AttachmentPicker value={attachments} onChange={setAttachments} />
      </div>

      {/* Security + submit */}
      <div className="rounded-xl bg-kampmax-muted/50 p-3">
        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-kampmax-text-secondary">
          <LifeBuoy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-kampmax-blue" />
          <span>{SUPPORT_SECURITY_NOTICE}</span>
        </p>
      </div>

      {formError && (
        <p className="rounded-lg bg-kampmax-error/10 px-3 py-2 text-xs text-kampmax-error">
          {formError}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={create.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-kampmax-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-kampmax-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {create.isPending ? "Opening request…" : "Submit request"}
          {!create.isPending && <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}