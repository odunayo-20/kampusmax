"use client";

import { useState } from "react";
import { StickyNote, Plus, X } from "lucide-react";
import { Button } from "@/components/ui";
import { cn, formatDateTime } from "@/lib/utils";
import type { VendorOrder, VendorOrderResult } from "@/types/vendor-orders";

export function OrderNotesPanel({
  order,
  busy,
  onAdd,
}: {
  order: VendorOrder;
  busy?: boolean;
  onAdd: (body: string) => Promise<VendorOrderResult> | VendorOrderResult;
}) {
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState("");

  const submit = async () => {
    const result = await onAdd(text.trim());
    if (result.ok) {
      setText("");
      setComposing(false);
    }
  };

  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-4">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
        <StickyNote className="h-3.5 w-3.5" aria-hidden />
        Internal notes
      </h3>

      {order.notes.length === 0 && !composing && (
        <p className="text-xs text-kampmax-text-muted">No internal notes yet.</p>
      )}

      {order.notes.length > 0 && (
        <ul className="mb-3 space-y-2">
          {order.notes.map((note) => (
            <li key={note.id} className="rounded-lg bg-kampmax-muted px-3 py-2">
              <p className="text-xs leading-relaxed text-kampmax-text">{note.body}</p>
              <p className="mt-1 text-[11px] text-kampmax-text-muted">
                {note.authorRole === "staff" ? "Staff" : "You"} · {formatDateTime(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {composing && (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Add a note only your team can see…"
            className="w-full rounded-lg border border-kampmax-border bg-white p-3 text-sm focus:outline-none focus:border-kampmax-blue"
            autoFocus
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setComposing(false)} disabled={busy} className="gap-1">
              <X className="h-3.5 w-3.5" aria-hidden />
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={busy || !text.trim()} onClick={submit} className="gap-1">
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Save note
            </Button>
          </div>
        </div>
      )}

      {!composing && (
        <Button
          variant="outline"
          size="sm"
          className={cn(order.notes.length > 0 && "mt-1")}
          disabled={busy}
          onClick={() => setComposing(true)}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add note
        </Button>
      )}

      <p className="mt-3 text-[11px] text-kampmax-text-secondary/80">
        Notes are private to your store — the buyer never sees them.
      </p>
    </div>
  );
}