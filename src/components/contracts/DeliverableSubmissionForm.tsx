"use client";

import { useReducer, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Paperclip,
  Plus,
  X,
  AlertCircle,
  Loader2,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  validateContractFiles,
  sanitizeExternalUrl,
  formatFileSize,
} from "@/lib/contract-utils";
import type { Milestone } from "@/types/contract";

// Secure deliverable submission form with a review step. Frontend validation is
// UX-only; the backend re-validates everything. Prevents accidental double
// submission by disabling during submit.

interface SubmissionValues {
  title: string;
  message: string;
  linkInput: string;
  links: string[];
  files: { name: string; size: number }[];
}

type DraftState = SubmissionValues;
type DraftAction =
  | { type: "set_title"; value: string }
  | { type: "set_message"; value: string }
  | { type: "set_link_input"; value: string }
  | { type: "add_link" }
  | { type: "remove_link"; index: number }
  | { type: "add_files"; files: File[] }
  | { type: "remove_file"; name: string };

const initialState: DraftState = {
  title: "",
  message: "",
  linkInput: "",
  links: [],
  files: [],
};

function reducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case "set_title":
      return { ...state, title: action.value };
    case "set_message":
      return { ...state, message: action.value };
    case "set_link_input":
      return { ...state, linkInput: action.value };
    case "add_link": {
      const safe = sanitizeExternalUrl(state.linkInput);
      if (!safe) return state;
      return { ...state, links: [...state.links, safe], linkInput: "" };
    }
    case "remove_link":
      return { ...state, links: state.links.filter((_, i) => i !== action.index) };
    case "add_files":
      return {
        ...state,
        files: [
          ...state.files,
          ...action.files.map((f) => ({ name: f.name, size: f.size })),
        ],
      };
    case "remove_file":
      return { ...state, files: state.files.filter((f) => f.name !== action.name) };
    default:
      return state;
  }
}

interface FormErrors {
  title?: string;
  message?: string;
  files?: string;
}

export function DeliverableSubmissionForm({
  milestone,
  contractId,
  onSubmit,
  onCancel,
  isResubmission = false,
  initialTitle,
}: {
  milestone: Milestone;
  contractId: string;
  onSubmit: (payload: {
    contractId: string;
    milestoneId: string;
    title: string;
    description: string;
    message: string;
    links: string[];
  }) => void;
  onCancel: () => void;
  isResubmission?: boolean;
  initialTitle?: string;
}) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    title: initialTitle ?? "",
  });
  const [step, setStep] = useState<"form" | "review">("form");
  const [errors, setErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  function handleAddLink() {
    if (!state.linkInput.trim()) return;
    const safe = sanitizeExternalUrl(state.linkInput);
    if (!safe) {
      setLinkError("Enter a valid https:// or http:// link.");
      return;
    }
    setLinkError(null);
    dispatch({ type: "add_link" });
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const result = validateContractFiles(selected);
    if (!result.valid) {
      setErrors((prev) => ({ ...prev, files: result.errors.join(" ") }));
    } else {
      setErrors((prev) => ({ ...prev, files: undefined }));
    }
    dispatch({ type: "add_files", files: selected });
    e.target.value = "";
  }

  function validateForm(): boolean {
    const next: FormErrors = {};
    if (!state.title.trim()) next.title = "Enter a deliverable title.";
    if (!state.message.trim()) next.message = "Add a message describing what you're submitting.";
    if (state.files.length === 0) next.files = "Attach at least one file.";
    if (state.files.length > 5) next.files = "You can attach up to 5 files.";
    setErrors(next);
    const ok = Object.values(next).every((v) => !v);
    if (ok) setStep("review");
    return ok;
  }

  function submit() {
    if (busy) return;
    setBusy(true);
    onSubmit({
      contractId,
      milestoneId: milestone.id,
      title: state.title.trim(),
      description: state.message.trim(),
      message: state.message.trim(),
      links: state.links,
    });
    // On success the parent closes the form; we don't reset here.
  }

  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-5">
      {step === "form" ? (
        <FormStep
          state={state}
          dispatch={dispatch}
          errors={errors}
          linkError={linkError}
          isResubmission={isResubmission}
          milestone={milestone}
          onAddLink={handleAddLink}
          onFiles={handleFiles}
          onRemoveLink={(i) => dispatch({ type: "remove_link", index: i })}
          onRemoveFile={(name) => dispatch({ type: "remove_file", name })}
          onCancel={onCancel}
          onReview={validateForm}
        />
      ) : (
        <ReviewStep
          state={state}
          milestone={milestone}
          isResubmission={isResubmission}
          busy={busy}
          onBack={() => setStep("form")}
          onCancel={onCancel}
          onSubmit={submit}
        />
      )}
    </div>
  );
}

function FormStep({
  state,
  dispatch,
  errors,
  linkError,
  isResubmission,
  milestone,
  onAddLink,
  onFiles,
  onRemoveLink,
  onRemoveFile,
  onCancel,
  onReview,
}: {
  state: DraftState;
  dispatch: React.Dispatch<DraftAction>;
  errors: FormErrors;
  linkError: string | null;
  isResubmission: boolean;
  milestone: Milestone;
  onAddLink: () => void;
  onFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLink: (i: number) => void;
  onRemoveFile: (name: string) => void;
  onCancel: () => void;
  onReview: () => void;
}) {
  return (
    <div>
      <h3 className="text-base font-bold text-kampmax-text">
        {isResubmission ? "Update & Resubmit Deliverable" : "Submit Deliverable"}
      </h3>
      <p className="mt-0.5 text-sm text-kampmax-text-secondary">
        Milestone: <span className="font-medium text-kampmax-text">{milestone.title}</span>
      </p>

      <div className="mt-4 space-y-4">
        <Field label="Deliverable title" error={errors.title}>
          <input
            value={state.title}
            onChange={(e) => dispatch({ type: "set_title", value: e.target.value })}
            maxLength={120}
            placeholder="e.g. Homepage final revision"
            className="w-full rounded-lg border border-kampmax-border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </Field>

        <Field label="Message" error={errors.message}>
          <textarea
            value={state.message}
            onChange={(e) => dispatch({ type: "set_message", value: e.target.value })}
            rows={3}
            maxLength={2000}
            placeholder="Describe what you're submitting and any notes for the client…"
            className="w-full rounded-lg border border-kampmax-border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </Field>

        <Field label="Files" error={errors.files}>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-kampmax-border-strong px-4 py-6 text-sm text-kampmax-text-secondary hover:bg-kampmax-muted/60">
            <Paperclip className="h-4 w-4" aria-hidden />
            Click to attach files
            <input
              type="file"
              multiple
              onChange={onFiles}
              className="sr-only"
              aria-label="Attach files"
            />
          </label>
          <p className="mt-1 text-xs text-kampmax-text-muted">
            PDF, DOC, ZIP, images, Figma, and more. Up to 5 files, 25 MB each.
          </p>
          {state.files.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {state.files.map((f) => (
                <li
                  key={f.name}
                  className="flex items-center justify-between gap-2 rounded-lg bg-kampmax-muted px-3 py-2 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Paperclip className="h-3.5 w-3.5 shrink-0 text-kampmax-text-secondary" aria-hidden />
                    <span className="truncate text-kampmax-text">{f.name}</span>
                    <span className="shrink-0 text-xs text-kampmax-text-muted">
                      {formatFileSize(f.size)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(f.name)}
                    aria-label={`Remove ${f.name}`}
                    className="rounded p-1 text-kampmax-text-secondary hover:bg-kampmax-border/50 hover:text-error-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Field>

        <Field label="External links (optional)" error={linkError ?? undefined}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kampmax-text-secondary" aria-hidden />
              <input
                value={state.linkInput}
                onChange={(e) => dispatch({ type: "set_link_input", value: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddLink();
                  }
                }}
                placeholder="https://…"
                className="w-full rounded-lg border border-kampmax-border py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <button
              type="button"
              onClick={onAddLink}
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text hover:bg-kampmax-muted"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          {state.links.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {state.links.map((link, i) => (
                <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-kampmax-muted px-3 py-2 text-sm">
                  <span className="truncate text-primary-600">{link}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveLink(i)}
                    aria-label={`Remove link ${link}`}
                    className="rounded p-1 text-kampmax-text-secondary hover:text-error-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Field>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-9 items-center rounded-md border border-kampmax-border bg-white px-3.5 text-sm font-medium text-kampmax-text hover:bg-kampmax-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onReview}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary-600 px-3.5 text-sm font-semibold text-white hover:bg-[#1258C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
        >
          Review Submission <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ReviewStep({
  state,
  milestone,
  isResubmission,
  busy,
  onBack,
  onCancel,
  onSubmit,
}: {
  state: DraftState;
  milestone: Milestone;
  isResubmission: boolean;
  busy: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div>
      <h3 className="text-base font-bold text-kampmax-text">Review Submission</h3>
      <p className="mt-0.5 text-sm text-kampmax-text-secondary">
        {isResubmission ? "Resubmitting" : "Submitting"} to milestone:{" "}
        <span className="font-medium text-kampmax-text">{milestone.title}</span>
      </p>

      <dl className="mt-4 space-y-3 rounded-lg border border-kampmax-border bg-kampmax-muted/40 p-4">
        <ReviewRow label="Deliverable">
          <span className="font-medium text-kampmax-text">{state.title}</span>
        </ReviewRow>
        <ReviewRow label="Message">
          <span className="text-kampmax-text-secondary">{state.message}</span>
        </ReviewRow>
        {state.files.length > 0 && (
          <ReviewRow label="Attachments">
            <ul className="space-y-1">
              {state.files.map((f) => (
                <li key={f.name} className="flex items-center gap-2 text-sm">
                  <Paperclip className="h-3.5 w-3.5 text-kampmax-text-secondary" aria-hidden />
                  <span className="text-kampmax-text">{f.name}</span>
                  <span className="text-xs text-kampmax-text-muted">{formatFileSize(f.size)}</span>
                </li>
              ))}
            </ul>
          </ReviewRow>
        )}
        {state.links.length > 0 && (
          <ReviewRow label="Links">
            <ul className="space-y-1">
              {state.links.map((l, i) => (
                <li key={i} className="truncate text-sm text-primary-600">
                  {l}
                </li>
              ))}
            </ul>
          </ReviewRow>
        )}
      </dl>

      <p className="mt-3 text-xs text-kampmax-text-muted">
        {isResubmission
          ? "Your previous submission history is preserved. This resubmission will be sent for client review."
          : "Once submitted, your deliverable will go to the client for review. You'll be notified of the outcome."}
      </p>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3.5 text-sm font-medium text-kampmax-text hover:bg-kampmax-muted disabled:opacity-60"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="inline-flex h-9 items-center rounded-md border border-kampmax-border bg-white px-3.5 text-sm font-medium text-kampmax-text hover:bg-kampmax-muted disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-md bg-primary-600 px-3.5 text-sm font-semibold text-white hover:bg-[#1258C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-60"
          )}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Submitting…" : isResubmission ? "Resubmit" : "Submit Deliverable"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-kampmax-text">{label}</label>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p role="alert" className="mt-1 flex items-center gap-1.5 text-xs text-error-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

function ReviewRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}
