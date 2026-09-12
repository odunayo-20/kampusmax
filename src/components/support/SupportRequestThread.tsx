"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, Lock, Send } from "lucide-react";
import { useReplySupportTicket } from "@/hooks/use-support";
import { canCustomerReply, SUPPORT_SECURITY_NOTICE } from "@/config/support";
import { AttachmentPicker, formatBytes } from "./AttachmentPicker";
import { cn, formatDateTime, formatTime } from "@/lib/utils";
import type {
  SupportAttachment,
  SupportMessage,
  SupportTicketDetail,
} from "@/types/admin";

function AttachmentChips({ attachments }: { attachments: SupportAttachment[] }) {
  if (attachments.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {attachments.map((a) => (
        <span
          key={a.id}
          className="inline-flex items-center gap-1.5 rounded-md bg-kampmax-muted px-2 py-1 text-[11px] text-kampmax-text-secondary"
        >
          {a.kind === "image" ? (
            <ImageIcon className="h-3 w-3" />
          ) : (
            <FileText className="h-3 w-3" />
          )}
          {a.name}
          <span>&middot;</span>
          {formatBytes(a.sizeBytes)}
        </span>
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: SupportMessage }) {
  const fromCustomer = message.postedBy === "customer";
  return (
    <div
      className={cn(
        "flex",
        fromCustomer ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
          fromCustomer
            ? "rounded-br-md bg-kampmax-blue text-white"
            : "rounded-bl-md border border-kampmax-border bg-kampmax-muted/50 text-kampmax-text"
        )}
      >
        {!fromCustomer && (
          <p className="mb-0.5 text-xs font-semibold text-kampmax-blue">
            Kampmax Support
          </p>
        )}
        <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
        <AttachmentChips attachments={message.attachments} />
        <p
          className={cn(
            "mt-1 text-[10px]",
            fromCustomer ? "text-white/60" : "text-kampmax-text-secondary"
          )}
        >
          {fromCustomer ? "You" : message.authorName} &middot;{" "}
          {formatDateTime(message.at)}
        </p>
      </div>
    </div>
  );
}

/**
 * Message thread + reply composer for one support case. The composer is read
 * only when the case is resolved/closed — reopening is a support-team
 * decision, enforced on the store as well as here.
 */
export function SupportRequestThread({ detail }: { detail: SupportTicketDetail }) {
  const { ticket } = detail;
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const reply = useReplySupportTicket(ticket.id);

  const openForReplies = canCustomerReply(ticket.status);

  const messages =
    detail.messages.length > 0
      ? detail.messages
      : [
          {
            id: `${ticket.id}-description`,
            ticketId: ticket.id,
            postedBy: "customer" as const,
            authorName: ticket.customer.name,
            visibility: "customer" as const,
            body: detail.description,
            attachments: [] as SupportAttachment[],
            at: ticket.createdAt,
          },
        ];

  function onSubmit() {
    if (!body.trim()) return;
    setError(null);
    reply.mutate(
      { body: body.trim(), attachments },
      {
        onSuccess: () => {
          setBody("");
          setAttachments([]);
        },
        onError: (err) => {
          setError(
            err instanceof Error ? err.message : "Could not send your message."
          );
        },
      }
    );
  }

  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-4">
      <div className="space-y-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      <div className="mt-4 border-t border-kampmax-border pt-4">
        {openForReplies ? (
          <div className="space-y-3">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Write a reply…"
              className="w-full rounded-xl border border-kampmax-border p-3 text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/50 focus:border-kampmax-blue focus:outline-none focus:ring-1 focus:ring-kampmax-blue/20"
            />
            <AttachmentPicker
              compact
              value={attachments}
              onChange={setAttachments}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-[11px] text-kampmax-text-secondary">
                <Lock className="h-3 w-3" />
                {SUPPORT_SECURITY_NOTICE}
              </p>
              <button
                type="button"
                onClick={onSubmit}
                disabled={reply.isPending || !body.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-kampmax-blue px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-kampmax-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reply.isPending ? "Sending…" : "Send reply"}
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            {error && <p className="text-xs text-kampmax-error">{error}</p>}
          </div>
        ) : (
          <p className="text-xs text-kampmax-text-secondary">
            This case is closed and can no longer be replied to. If you still
            need help,{" "}
            <a href="/support/new" className="text-kampmax-blue underline">
              open a new request
            </a>
            .
          </p>
        )}
      </div>

      <p className="mt-3 text-[10px] text-kampmax-text-secondary">
        Replies are usually answered within the working hours shown above.
        Last activity: {formatTime(ticket.updatedAt)}.
      </p>
    </div>
  );
}