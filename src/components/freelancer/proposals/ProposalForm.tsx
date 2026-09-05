"use client";

import { useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import type {
  Opportunity,
  ProposalDeliveryUnit,
} from "@/types/opportunity";
import {
  PROPOSAL_ATTACHMENT_ALLOWED,
  PROPOSAL_ATTACHMENT_MAX_BYTES,
  PROPOSAL_COVER_LETTER_MAX,
} from "@/config/opportunity";
import { formatNaira } from "@/lib/utils";
import {
  ProposalFormValues,
  emptyProposalFormValues,
} from "./proposal-form-values";

interface ProposalFormProps {
  opportunity: Opportunity;
  values: ProposalFormValues;
  onChange: (values: ProposalFormValues) => void;
  onSubmit: () => void;
  onSaveDraft?: () => void;
  submitting?: boolean;
  saving?: boolean;
}

export function ProposalForm({
  opportunity,
  values,
  onChange,
  onSubmit,
  onSaveDraft,
  submitting,
  saving,
}: ProposalFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof ProposalFormValues>(key: K, value: ProposalFormValues[K]) => {
    onChange({ ...values, [key]: value });
  };

  function handleFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    setFileError(null);
    const added: typeof values.attachments = [];
    for (const file of Array.from(files)) {
      if (!PROPOSAL_ATTACHMENT_ALLOWED.includes(file.type as (typeof PROPOSAL_ATTACHMENT_ALLOWED)[number])) {
        setFileError(`"${file.name}" isn't a supported file type (PDF, DOC/DOCX, PNG, JPG).`);
        continue;
      }
      if (file.size > PROPOSAL_ATTACHMENT_MAX_BYTES) {
        setFileError(`"${file.name}" is larger than 5MB.`);
        continue;
      }
      added.push({
        id: `fl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        filename: file.name,
        sizeBytes: file.size,
        mimeType: file.type,
      });
    }
    if (added.length) update("attachments", [...values.attachments, ...added]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!values.coverLetter.trim()) e.coverLetter = "A cover letter is required.";
    else if (values.coverLetter.trim().length > PROPOSAL_COVER_LETTER_MAX)
      e.coverLetter = `Cover letter must be ${PROPOSAL_COVER_LETTER_MAX} characters or fewer.`;

    const amount = Number(values.proposedAmount);
    if (values.proposedAmount.trim() && (!Number.isFinite(amount) || amount < 0))
      e.proposedAmount = "Enter a valid non-negative amount.";

    const delivery = Number(values.deliveryValue);
    if (!values.deliveryValue.trim() || !Number.isFinite(delivery) || delivery <= 0)
      e.deliveryValue = "Enter a valid delivery estimate.";

    for (const q of opportunity.screeningQuestions) {
      if (!q.optional && !values.screeningAnswers[q.id]?.trim()) {
        e[`q_${q.id}`] = "This question requires an answer.";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) {
      return;
    }
    onSubmit();
  }

  const amountNumeric = Number(values.proposedAmount);
  const parsedAmount = Number.isFinite(amountNumeric) && amountNumeric > 0 ? amountNumeric : undefined;

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        handleSubmit();
      }}
      className="space-y-6"
      noValidate
    >
      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Cover letter</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Introduce yourself to {opportunity.employer.name}. Explain why you&apos;re a great fit and how you&apos;d approach this work.
        </p>
        <div className="mt-3">
          <textarea
            value={values.coverLetter}
            onChange={(e) => update("coverLetter", e.target.value)}
            rows={6}
            placeholder="Hi, I'd love to help with this project…"
            aria-label="Cover letter"
            className={
              "w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 " +
              (errors.coverLetter
                ? "border-error-600 focus:ring-error-600/20"
                : "border-neutral-200 focus:border-primary-600 focus:ring-primary-600/20")
            }
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.coverLetter ? (
              <p className="text-xs text-error-600">{errors.coverLetter}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-neutral-400">
              {values.coverLetter.length}/{PROPOSAL_COVER_LETTER_MAX}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Price & delivery</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Proposed amount (₦, optional)"
            type="number"
            min={0}
            step={500}
            inputMode="numeric"
            placeholder="e.g. 200000"
            value={values.proposedAmount}
            onChange={(e) => update("proposedAmount", e.target.value)}
            error={errors.proposedAmount}
            hint={
              opportunity.budget.min !== undefined || opportunity.budget.max !== undefined
                ? `Client budget: ${opportunity.budget.min !== undefined ? formatNaira(opportunity.budget.min) : ""}–${opportunity.budget.max !== undefined ? formatNaira(opportunity.budget.max) : "open"}.`
                : undefined
            }
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Deliver in"
              type="number"
              min={1}
              inputMode="numeric"
              placeholder="e.g. 5"
              value={values.deliveryValue}
              onChange={(e) => update("deliveryValue", e.target.value)}
              error={errors.deliveryValue}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-900">Unit</label>
              <Select
                value={values.deliveryUnit}
                onChange={(e) => update("deliveryUnit", e.target.value as ProposalDeliveryUnit)}
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </Select>
            </div>
          </div>
        </div>
        {parsedAmount !== undefined && !Number.isNaN(parsedAmount) && (
          <p className="mt-3 text-xs text-neutral-500">
            You&apos;re proposing{" "}
            <span className="font-semibold text-neutral-800">{formatNaira(parsedAmount)}</span>.
          </p>
        )}
      </section>

      {opportunity.screeningQuestions.length > 0 && (
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Client questions</h2>
          <p className="mt-1 text-xs text-neutral-500">
            These questions came from the client. Answer them to complete your proposal.
          </p>
          <div className="mt-4 space-y-4">
            {opportunity.screeningQuestions.map((q, idx) => (
              <div key={q.id}>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  {idx + 1}. {q.question}
                  {q.optional && <span className="ml-1 text-xs font-normal text-neutral-400">(optional)</span>}
                </label>
                <textarea
                  value={values.screeningAnswers[q.id] ?? ""}
                  onChange={(e) =>
                    update("screeningAnswers", {
                      ...values.screeningAnswers,
                      [q.id]: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Your answer…"
                  className={
                    "w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 " +
                    (errors[`q_${q.id}`]
                      ? "border-error-600 focus:ring-error-600/20"
                      : "border-neutral-200 focus:border-primary-600 focus:ring-primary-600/20")
                  }
                />
                {errors[`q_${q.id}`] && (
                  <p className="mt-1 text-xs text-error-600">{errors[`q_${q.id}`]}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Attachments (optional)</h2>
        <p className="mt-1 text-xs text-neutral-500">
          PDF, DOC/DOCX, PNG or JPG · up to 5MB each.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,image/png,image/jpeg"
          onChange={(e) => handleFile(e.target.files)}
          className="hidden"
          id="proposal-attachments"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="mr-1.5 h-4 w-4" aria-hidden />
          Add file
        </Button>
        {fileError && <p className="mt-2 text-xs text-error-600">{fileError}</p>}
        {values.attachments.length > 0 && (
          <ul className="mt-3 space-y-2">
            {values.attachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm"
              >
                <span className="truncate text-neutral-700">
                  <Paperclip className="mr-1.5 inline h-3.5 w-3.5 text-neutral-400" aria-hidden />
                  {a.filename}
                  <span className="ml-2 text-xs text-neutral-400">
                    {(a.sizeBytes / 1024 / 1024).toFixed(2)}MB
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${a.filename}`}
                  onClick={() =>
                    update("attachments", values.attachments.filter((x) => x.id !== a.id))
                  }
                  className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-error-600"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        {onSaveDraft && (
          <Button type="button" variant="outline" onClick={onSaveDraft} disabled={saving || submitting}>
            {saving ? "Saving…" : "Save draft"}
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Preparing…" : "Review proposal"}
        </Button>
      </div>
    </form>
  );
}

export { emptyProposalFormValues };
