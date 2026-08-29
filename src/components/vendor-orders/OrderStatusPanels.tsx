"use client";

import { useState } from "react";
import { AlertTriangle, Landmark, RotateCcw, Send, X } from "lucide-react";
import { Button } from "@/components/ui";
import { cn, formatNaira, formatDateTime, timeAgo } from "@/lib/utils";
import type {
  VendorOrder,
  VendorOrderResult,
} from "@/types/vendor-orders";

// ── Escrow panel ──────────────────────────────────────────────

export function EscrowPanel({ order }: { order: VendorOrder }) {
  const e = order.escrow;
  if (e.state === "none") return null;

  const states: Record<string, { label: string; className: string }> = {
    funds_held: { label: "Funds held", className: "bg-kampmax-gold/10 text-kampmax-gold-dark" },
    awaiting_fulfillment: { label: "Awaiting fulfillment", className: "bg-kampmax-blue/10 text-kampmax-blue" },
    release_eligible: { label: "Ready to release", className: "bg-kampmax-info/10 text-kampmax-info" },
    released: { label: "Released", className: "bg-kampmax-success/10 text-kampmax-success" },
    refunded: { label: "Refunded", className: "bg-kampmax-error/10 text-kampmax-error" },
  };
  const s = states[e.state] ?? { label: e.state.replace(/_/g, " "), className: "bg-kampmax-muted text-kampmax-text-secondary" };

  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-4">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
        <Landmark className="h-3.5 w-3.5" aria-hidden />
        Escrow
      </h3>
      <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", s.className)}>
        {s.label}
      </span>
      {e.displayAmount != null && (
        <p className="mt-2 text-sm text-kampmax-text">
          Working balance <span className="font-semibold tabular-nums">{formatNaira(e.displayAmount)}</span>
        </p>
      )}
      {e.updatedAt && (
        <p className="mt-0.5 text-[11px] text-kampmax-text-muted">Updated {formatDateTime(e.updatedAt)}</p>
      )}
      {e.note && <p className="mt-2 text-xs text-kampmax-text-secondary">{e.note}</p>}
      <p className="mt-3 text-[11px] text-kampmax-text-secondary/80">
        Escrow and payouts are handled on Kampmax's side. Funds move automatically once the buyer
        confirms delivery and the dispute window passes.
      </p>
    </div>
  );
}

// ── Dispute panel ─────────────────────────────────────────────

export function DisputePanel({
  order,
  busy,
  onRespond,
}: {
  order: VendorOrder;
  busy?: boolean;
  onRespond: (response: string) => Promise<VendorOrderResult> | VendorOrderResult;
}) {
  const [open, setOpen] = useState(false);
  const d = order.dispute;

  if (d.status === "none") return null;

  const isOpen = d.status === "opened" || d.status === "under_review" || d.status === "requirements_sent";

  return (
    <div className={cn("rounded-xl border bg-white p-4", isOpen ? "border-kampmax-error/40" : "border-kampmax-border")}>
      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
        <AlertTriangle className="h-3.5 w-3.5 text-kampmax-error" aria-hidden />
        Issue / dispute
      </h3>

      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
          isOpen
            ? "bg-kampmax-error/10 text-kampmax-error"
            : d.status === "resolved"
              ? "bg-kampmax-success/10 text-kampmax-success"
              : "bg-kampmax-muted text-kampmax-text-secondary"
        )}
      >
        {d.status.replace(/_/g, " ")}
      </span>

      {d.openedAt && (
        <p className="mt-2 text-[11px] text-kampmax-text-muted">Opened {formatDateTime(d.openedAt)}</p>
      )}
      {d.reason && <p className="mt-2 text-sm text-kampmax-text">{d.reason}</p>}
      {d.customerClaim && (
        <p className="mt-1 rounded-lg bg-kampmax-muted px-3 py-2 text-xs text-kampmax-text-secondary">
          <span className="font-semibold text-kampmax-text">Buyer says:</span> {d.customerClaim}
        </p>
      )}

      {d.timeline.length > 0 && (
        <ul className="mt-3 space-y-2">
          {d.timeline.map((evt) => (
            <li key={evt.id} className="border-l-2 border-kampmax-border pl-3">
              <p className="text-xs font-medium text-kampmax-text">{evt.title}</p>
              {evt.detail && <p className="mt-0.5 text-xs text-kampmax-text-secondary">{evt.detail}</p>}
              <p className="mt-0.5 text-[11px] text-kampmax-text-muted">
                {evt.role === "customer" ? "Buyer" : evt.role === "vendor" ? "You" : "Kampmax support"} · {timeAgo(evt.at)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {isOpen && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 gap-1.5"
          disabled={busy}
          onClick={() => setOpen(true)}
        >
          <Send className="h-3.5 w-3.5" aria-hidden />
          Respond to dispute
        </Button>
      )}
      {!isOpen && (
        <p className="mt-2 text-[11px] text-kampmax-text-secondary/80">
          Kampmax support is handling this. No action needed from you.
        </p>
      )}

      {open && (
        <RespondDialog
          busy={busy}
          onCancel={() => setOpen(false)}
          onConfirm={async (response) => {
            const result = await onRespond(response);
            if (result.ok) setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function RespondDialog({
  busy,
  onCancel,
  onConfirm,
}: {
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (response: string) => Promise<void> | void;
}) {
  const [text, setText] = useState("");

  return (
    <div role="dialog" aria-modal="true" aria-label="Respond to dispute" className="fixed inset-0 z-50 flex items-center justify-center bg-kampmax-navy/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-kampmax-border bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-kampmax-text">Respond to dispute</h3>
            <p className="mt-0.5 text-xs text-kampmax-text-secondary">
              Your response is shared with Kampmax support and the buyer.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="rounded-md p-1 text-kampmax-text-secondary hover:bg-kampmax-muted"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Explain what happened and how you'd like to resolve it…"
          className="w-full rounded-lg border border-kampmax-border bg-white p-3 text-sm focus:outline-none focus:border-kampmax-blue"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={busy || !text.trim()}
            onClick={() => onConfirm(text.trim())}
            className="gap-1.5"
          >
            <Send className="h-3.5 w-3.5" aria-hidden />
            Submit response
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Refund panel ──────────────────────────────────────────────

export function RefundPanel({ order }: { order: VendorOrder }) {
  const r = order.refund;
  if (r.status === "none") return null;

  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-4">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        Refund
      </h3>
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
          r.status === "refunded"
            ? "bg-kampmax-success/10 text-kampmax-success"
            : r.status === "rejected"
              ? "bg-kampmax-error/10 text-kampmax-error"
              : "bg-kampmax-gold/10 text-kampmax-gold-dark"
        )}
      >
        {r.status.replace(/_/g, " ")}
      </span>
      {r.amount != null && (
        <p className="mt-2 text-sm text-kampmax-text">
          Amount <span className="font-semibold tabular-nums">{formatNaira(r.amount)}</span>
        </p>
      )}
      {r.reason && <p className="mt-1 text-xs text-kampmax-text-secondary">{r.reason}</p>}
      {r.requestedAt && (
        <p className="mt-1 text-[11px] text-kampmax-text-muted">Requested {formatDateTime(r.requestedAt)}</p>
      )}
      {r.status !== "refunded" && r.status !== "rejected" && (
        <p className="mt-3 text-[11px] text-kampmax-text-secondary/80">
          Refunds are processed by Kampmax back to the buyer's original payment method.
        </p>
      )}
    </div>
  );
}