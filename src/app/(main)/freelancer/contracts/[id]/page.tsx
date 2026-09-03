"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFreelancerContract,
  acceptFreelancerContract,
  cancelFreelancerContract,
  completeFreelancerContract,
  submitFreelancerDeliverable,
  resubmitFreelancerDeliverable,
} from "@/services/contract";
import type { Contract, Deliverable } from "@/types/contract";
import { CONTRACT_STATUS } from "@/types/contract";
import {
  ContractOverview,
  ContractSection,
  ContractStatusBadge,
  NextActionPanel,
  MilestoneCard,
  ContractTimeline,
  ContractFiles,
  DeliverableCard,
  DeliverableSubmissionForm,
  AcceptContractDialog,
  CancelContractDialog,
  CompleteContractDialog,
} from "@/components/contracts";

type TabId = "overview" | "milestones" | "deliverables" | "files" | "activity";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "milestones", label: "Milestones" },
  { id: "deliverables", label: "Deliverables" },
  { id: "files", label: "Files" },
  { id: "activity", label: "Activity" },
];

// Maps backend error codes to friendly, non-internal messages (spec §59).
function friendlyError(code: string): string {
  switch (code) {
    case "UNAUTHORIZED":
      return "You need to sign in again to continue.";
    case "FORBIDDEN":
      return "You are not permitted to perform this action.";
    case "NOT_FOUND":
      return "This contract is no longer available.";
    case "STATE_CONFLICT":
      return "This contract has changed. We've refreshed the latest status below.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function ContractDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const contractId = String(params.id);

  // The contract id is untrusted — the service scopes ownership to the
  // authenticated user (IDOR/BOLA protection). A single source object is held
  // locally and refreshed from the authoritative store after each mutation.
  const [contract, setContract] = useState<Contract | null>(() =>
    getFreelancerContract(contractId)
  );
  const [tab, setTab] = useState<TabId>("overview");

  // Dialog + mutation state
  const [showAccept, setShowAccept] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [busy, setBusy] = useState<null | "accept" | "cancel" | "complete" | "submit">(null);
  const [error, setError] = useState<string | null>(null);
  const [conflictNotice, setConflictNotice] = useState(false);
  const [submitMilestoneId, setSubmitMilestoneId] = useState<string | null>(null);
  const [resubmitDeliverableId, setResubmitDeliverableId] = useState<string | null>(null);

  const deliverables = useMemo(
    () => contract?.deliverables ?? [],
    [contract]
  );

  if (!contract) {
    return (
      <div className="rounded-xl border border-kampmax-border bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error-50 text-error-600 ring-1 ring-error-100">
          <ShieldAlert className="h-7 w-7" aria-hidden />
        </div>
        <h2 className="mt-4 text-lg font-bold text-kampmax-text">
          This contract is no longer available.
        </h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-kampmax-text-secondary">
          The contract may have been cancelled, completed, or you may no longer
          have access to it.
        </p>
        <button
          type="button"
          onClick={() => router.push("/freelancer/contracts")}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-kampmax-border bg-white px-4 py-2 text-sm font-semibold text-kampmax-text hover:bg-kampmax-muted"
        >
          Back to Contracts
        </button>
      </div>
    );
  }

  const refresh = (updated: Contract) => {
    setContract(updated);
    setConflictNotice(false);
  };

  // contract is guaranteed non-null here (guarded above). Capture the id so the
  // mutation handlers below can use it without re-widening the nullable state.
  const currentContractId = contract.id;

  // ── Mutation handlers ─────────────────────────────────────

  function runAccept() {
    if (busy) return;
    setBusy("accept");
    setError(null);
    const result = acceptFreelancerContract(currentContractId);
    setBusy(null);
    if (result.ok) {
      setShowAccept(false);
      setConflictNotice(false);
      setContract(result.contract);
    } else {
      setError(friendlyError(result.code));
      if (result.code === "STATE_CONFLICT" || result.code === "NOT_FOUND") {
        const latest = getFreelancerContract(currentContractId);
        if (latest) refresh(latest);
      }
    }
  }

  function runCancel(reason: string, details: string) {
    if (busy) return;
    setBusy("cancel");
    setError(null);
    const fullReason = details.trim() ? `${reason}${details.trim() ? ` — ${details.trim()}` : ""}` : reason;
    const result = cancelFreelancerContract(currentContractId, fullReason);
    setBusy(null);
    if (result.ok) {
      setShowCancel(false);
      setContract(result.contract);
    } else {
      setError(friendlyError(result.code));
      if (result.code === "STATE_CONFLICT" || result.code === "NOT_FOUND") {
        const latest = getFreelancerContract(currentContractId);
        if (latest) refresh(latest);
      }
    }
  }

  function runComplete() {
    if (busy) return;
    setBusy("complete");
    setError(null);
    const result = completeFreelancerContract(currentContractId);
    setBusy(null);
    if (result.ok) {
      setShowComplete(false);
      setContract(result.contract);
    } else {
      setError(friendlyError(result.code));
      if (result.code === "STATE_CONFLICT" || result.code === "NOT_FOUND") {
        const latest = getFreelancerContract(currentContractId);
        if (latest) refresh(latest);
      }
    }
  }

  function runSubmitDeliverable(payload: {
    contractId: string;
    milestoneId: string;
    title: string;
    description: string;
    message: string;
    links: string[];
  }) {
    if (busy) return;
    setBusy("submit");
    setError(null);
    const result = submitFreelancerDeliverable(
      payload.contractId,
      payload.milestoneId,
      {
        title: payload.title,
        description: payload.description,
        message: payload.message,
        links: payload.links,
      }
    );
    setBusy(null);
    if (result.ok) {
      setSubmitMilestoneId(null);
      setResubmitDeliverableId(null);
      setContract(result.contract);
    } else {
      setError(friendlyError(result.code));
      if (result.code === "STATE_CONFLICT" || result.code === "NOT_FOUND") {
        const latest = getFreelancerContract(currentContractId);
        if (latest) refresh(latest);
      }
    }
  }

  function runResubmit(deliverableId: string, payload: { message: string; links: string[] }) {
    if (busy) return;
    setBusy("submit");
    setError(null);
    const result = resubmitFreelancerDeliverable(currentContractId, deliverableId, payload);
    setBusy(null);
    if (result.ok) {
      setSubmitMilestoneId(null);
      setResubmitDeliverableId(null);
      setContract(result.contract);
    } else {
      setError(friendlyError(result.code));
      if (result.code === "STATE_CONFLICT" || result.code === "NOT_FOUND") {
        const latest = getFreelancerContract(currentContractId);
        if (latest) refresh(latest);
      }
    }
  }

  const isTerminal =
    contract.status === CONTRACT_STATUS.COMPLETED ||
    contract.status === CONTRACT_STATUS.CANCELLED;

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div>
        <button
          type="button"
          onClick={() => router.push("/freelancer/contracts")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-kampmax-text-secondary hover:text-kampmax-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Contracts
        </button>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-kampmax-text">{contract.projectTitle}</h1>
          <ContractStatusBadge status={contract.status} className="shrink-0" />
        </div>
      </div>

      {/* Conflict notice */}
      {conflictNotice && (
        <div role="status" className="rounded-lg border border-info-100 bg-info-50 p-3 text-sm text-info-700">
          This contract has changed. We&apos;ve refreshed the latest contract status.
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg border border-error-100 bg-error-50 p-3 text-sm text-error-700">
          {error}
        </div>
      )}

      {/* Next action */}
      {!isTerminal && (
        <NextActionPanel
          contract={contract}
          onAccept={() => setShowAccept(true)}
          onSubmit={() => {
            const m = contract.milestones.find((x) => x.status === "ACTIVE" || x.status === "SUBMITTED" || x.status === "REVISION_REQUESTED");
            setSubmitMilestoneId(m?.id ?? contract.milestones[0]?.id ?? null);
            if (m) setTab("deliverables");
          }}
          onResubmit={() => {
            const pending = contract.deliverables.find((d) => d.status === "REVISION_REQUESTED");
            if (pending) {
              setResubmitDeliverableId(pending.id);
              setTab("deliverables");
            }
          }}
          onComplete={() => setShowComplete(true)}
          onOpenWorkspace={() => setTab("overview")}
        />
      )}

      {/* Tabs */}
      <div
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border"
        role="tablist"
        aria-label="Contract sections"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          let count: number | undefined;
          if (t.id === "milestones") count = contract.milestones.length;
          if (t.id === "deliverables") count = deliverables.length;
          if (t.id === "files") count = contract.files.length;
          if (t.id === "activity") count = contract.timeline.length;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                active
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-kampmax-text-secondary hover:text-kampmax-text"
              )}
            >
              {t.label}
              {typeof count === "number" && count > 0 && (
                <span className="ml-1.5 rounded-full bg-kampmax-muted px-1.5 py-0.5 text-xs text-kampmax-text-secondary">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <OverviewTab
          contract={contract}
          onAccept={() => setShowAccept(true)}
          onComplete={() => setShowComplete(true)}
          onOpenSubmit={() => {
            const m = contract.milestones.find((x) => x.status === "ACTIVE" || x.status === "SUBMITTED");
            setSubmitMilestoneId(m?.id ?? contract.milestones[0]?.id ?? null);
            if (m) setTab("deliverables");
          }}
        />
      )}
      {tab === "milestones" && (
        <div className="space-y-3">
          {contract.milestones.length === 0 ? (
            <p className="text-sm text-kampmax-text-secondary">No milestones have been set for this contract.</p>
          ) : (
            contract.milestones.map((m) => <MilestoneCard key={m.id} milestone={m} />)
          )}
        </div>
      )}
      {tab === "deliverables" && (
        <DeliverablesTab
          contract={contract}
          deliverables={deliverables}
          submitMilestoneId={submitMilestoneId}
          resubmitDeliverableId={resubmitDeliverableId}
          busySubmit={busy === "submit"}
          onSubmitMilestone={(id) => setSubmitMilestoneId(id)}
          onCancelSubmit={() => {
            setSubmitMilestoneId(null);
            setResubmitDeliverableId(null);
          }}
          onSubmit={runSubmitDeliverable}
          onResubmit={runResubmit}
          onStartResubmit={(id) => setResubmitDeliverableId(id)}
          onStopResubmit={() => setResubmitDeliverableId(null)}
        />
      )}
      {tab === "files" && (
        <ContractSection title="Project Files">
          <ContractFiles files={contract.files} />
        </ContractSection>
      )}
      {tab === "activity" && (
        <ContractSection title="Activity Timeline">
          <ContractTimeline events={contract.timeline} />
        </ContractSection>
      )}

      {/* Dialogs */}
      {showAccept && (
        <AcceptContractDialog
          contract={contract}
          busy={busy === "accept"}
          error={busy === "accept" ? null : error}
          onConfirm={runAccept}
          onClose={() => setShowAccept(false)}
        />
      )}
      {showCancel && (
        <CancelContractDialog
          contractTitle={contract.projectTitle}
          busy={busy === "cancel"}
          error={busy === "cancel" ? null : error}
          onConfirm={runCancel}
          onClose={() => setShowCancel(false)}
        />
      )}
      {showComplete && (
        <CompleteContractDialog
          projectTitle={contract.projectTitle}
          busy={busy === "complete"}
          error={busy === "complete" ? null : error}
          onConfirm={runComplete}
          onClose={() => setShowComplete(false)}
        />
      )}
    </div>
  );
}

// ── Overview tab ────────────────────────────────────────────

function OverviewTab({
  contract,
  onAccept,
  onComplete,
  onOpenSubmit,
}: {
  contract: Contract;
  onAccept: () => void;
  onComplete: () => void;
  onOpenSubmit: () => void;
}) {
  return (
    <div className="space-y-5">
      <ContractOverview contract={contract} />

      {(contract.canAccept || contract.canComplete) && (
        <div className="flex flex-wrap gap-2">
          {contract.canAccept && (
            <PrimaryAction onClick={onAccept} label="Accept Contract" />
          )}
          {contract.canComplete && (
            <PrimaryAction onClick={onComplete} label="Mark Work Complete" />
          )}
          {contract.status === CONTRACT_STATUS.ACTIVE && (
            <SecondaryAction onClick={onOpenSubmit} label="Submit Deliverable" />
          )}
        </div>
      )}

      <ContractSection title="Agreement">
        <div className="space-y-4">
          <Paragraph label="Scope" text={contract.agreement.scope} />
          <Paragraph label="Terms" text={contract.agreement.terms} />
          <Paragraph label="Expectations" text={contract.agreement.expectations} />
          <div>
            <h3 className="text-sm font-semibold text-kampmax-text">Deliverables</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-kampmax-text-secondary">
              {contract.agreement.deliverables.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
          {contract.agreement.conditions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-kampmax-text">Conditions</h3>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-kampmax-text-secondary">
                {contract.agreement.conditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </ContractSection>

      <ContractSection title="Project Scope">
        <div className="grid gap-5 sm:grid-cols-2">
          <ScopeList title="Included" items={contract.projectScope.included} positive />
          <ScopeList title="Excluded" items={contract.projectScope.excluded} negative />
        </div>
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-kampmax-text">Requirements</h3>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-kampmax-text-secondary">
            {contract.projectScope.requirements.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      </ContractSection>

      {contract.status === CONTRACT_STATUS.DISPUTED && (
        <DisputeBanner status={contract.disputeStatus} />
      )}
    </div>
  );
}

function DisputeBanner({ status }: { status?: string }) {
  return (
    <div role="alert" className="rounded-xl border border-accent-100 bg-accent-50 p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold text-accent-700">
        <ShieldAlert className="h-5 w-5" aria-hidden /> Contract Under Dispute
      </h2>
      <p className="mt-1.5 text-sm text-accent-700/90">
        This project is currently under dispute review. You can continue to
        view the contract history and relevant project information.
      </p>
      {status && (
        <p className="mt-2 text-sm text-accent-700">
          Status: <span className="font-semibold">{status.replace(/_/g, " ")}</span>
        </p>
      )}
    </div>
  );
}

function ScopeList({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: string[];
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-kampmax-text">{title}</h3>
      <ul className="mt-1.5 space-y-1 text-sm text-kampmax-text-secondary">
        {items.length === 0 && <li>None listed</li>}
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", positive ? "bg-success-500" : "bg-neutral-400")} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Paragraph({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-kampmax-text">{label}</h3>
      <p className="mt-1 text-sm leading-relaxed text-kampmax-text-secondary">{text}</p>
    </div>
  );
}

function PrimaryAction({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-[#1258C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
    >
      {label}
    </button>
  );
}

function SecondaryAction({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-4 text-sm font-semibold text-kampmax-text hover:bg-kampmax-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
    >
      {label}
    </button>
  );
}

// ── Deliverables tab ────────────────────────────────────────

function DeliverablesTab({
  contract,
  deliverables,
  submitMilestoneId,
  resubmitDeliverableId,
  busySubmit,
  onSubmitMilestone,
  onCancelSubmit,
  onSubmit,
  onResubmit,
  onStartResubmit,
  onStopResubmit,
}: {
  contract: Contract;
  deliverables: Deliverable[];
  submitMilestoneId: string | null;
  resubmitDeliverableId: string | null;
  busySubmit: boolean;
  onSubmitMilestone: (id: string) => void;
  onCancelSubmit: () => void;
  onSubmit: (payload: {
    contractId: string;
    milestoneId: string;
    title: string;
    description: string;
    message: string;
    links: string[];
  }) => void;
  onResubmit: (deliverableId: string, payload: { message: string; links: string[] }) => void;
  onStartResubmit: (id: string) => void;
  onStopResubmit: () => void;
}) {
  const activeMilestones = contract.milestones.filter(
    (m) => m.status !== "COMPLETED" && m.status !== "CANCELLED"
  );
  const isNewAllowed =
    contract.status === CONTRACT_STATUS.ACTIVE ||
    contract.status === CONTRACT_STATUS.REVISION_REQUESTED ||
    contract.status === CONTRACT_STATUS.AWAITING_CLIENT_REVIEW;

  return (
    <div className="space-y-5">
      {busySubmit && (
        <div className="flex items-center gap-2 text-sm text-kampmax-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Submitting…
        </div>
      )}

      {isNewAllowed && activeMilestones.length > 0 && !submitMilestoneId && (
        <ContractSection title="Submit a Deliverable" subtitle="Choose a milestone to submit work to">
          <ul className="space-y-2">
            {activeMilestones.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onSubmitMilestone(m.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-kampmax-border bg-white px-4 py-3 text-left text-sm font-medium text-kampmax-text hover:border-primary-400 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  <span>{m.title}</span>
                  <span className="text-kampmax-text-secondary">Submit →</span>
                </button>
              </li>
            ))}
          </ul>
        </ContractSection>
      )}

      {submitMilestoneId && (() => {
        const milestone = contract.milestones.find((m) => m.id === submitMilestoneId);
        if (!milestone) return null;
        return (
          <DeliverableSubmissionForm
            milestone={milestone}
            contractId={contract.id}
            onSubmit={onSubmit}
            onCancel={onCancelSubmit}
          />
        );
      })()}

      {resubmitDeliverableId && resubmitDeliverableId !== submitMilestoneId && (() => {
        const target = deliverables.find((d) => d.id === resubmitDeliverableId);
        if (!target) return null;
        const milestone = contract.milestones.find((m) => m.id === target.milestoneId);
        if (!milestone) return null;
        return (
          <DeliverableSubmissionForm
            milestone={milestone}
            contractId={contract.id}
            isResubmission
            initialTitle={target.title}
            onSubmit={(payload) =>
              onResubmit(target.id, { message: payload.message, links: payload.links })
            }
            onCancel={onStopResubmit}
          />
        );
      })()}

      <div>
        <h2 className="mb-3 text-base font-bold text-kampmax-text">Deliverables</h2>
        {deliverables.length === 0 ? (
          <ContractSection title="No deliverables yet">
            <p className="text-sm text-kampmax-text-secondary">
              Submit your first deliverable to get started on this contract.
            </p>
          </ContractSection>
        ) : (
          <div className="space-y-3">
            {deliverables.map((d) => (
              <DeliverableCard
                key={d.id}
                deliverable={d}
                canResubmit={contract.status === CONTRACT_STATUS.REVISION_REQUESTED || d.status === "REVISION_REQUESTED"}
                onResubmit={() => onStartResubmit(d.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
