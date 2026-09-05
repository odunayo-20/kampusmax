"use client";

import { Store, Verified } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { getCampusById } from "@/services/campus";
import { getProductById } from "@/services/products";
import { Conversation } from "@/types";
import { getConversationPeer } from "./message-utils";

/**
 * Read-only conversation/participant info panel (desktop only). Only public
 * profile data is shown — store info / department & level, ratings and
 * specialties. Contact details (email/phone) and message bodies are never
 * rendered here, and nothing is persisted to the URL.
 */
export function ConversationInfoPanel({ conversation }: { conversation: Conversation }) {
  const { user } = useAuth();
  const peer = getConversationPeer(user!.id, conversation);
  const campus = peer.user ? getCampusById(peer.user.campusId) : undefined;
  const relatedProduct = conversation.productId
    ? getProductById(conversation.productId)
    : undefined;

  return (
    <div className="hidden lg:block w-72 border-l border-kampmax-border bg-white overflow-y-auto flex-shrink-0">
      <div className="p-4 text-center border-b border-kampmax-border">
        <div
          className={cn(
            "w-16 h-16 rounded-full mx-auto flex items-center justify-center font-bold text-lg mb-2",
            peer.isVendor ? "bg-kampmax-gold text-kampmax-navy" : "bg-kampmax-navy text-white"
          )}
        >
          {peer.isVendor ? <Store className="h-7 w-7" aria-hidden /> : peer.name.charAt(0)}
        </div>
        <p className="text-sm font-bold text-kampmax-text flex items-center justify-center gap-1">
          {peer.name}
          {(peer.isVendor ? peer.vendor?.verified : peer.user?.isVerified) && (
            <Verified className="h-3.5 w-3.5 text-kampmax-blue flex-shrink-0" aria-label="Verified" />
          )}
        </p>
        <p className="text-xs text-kampmax-text-secondary mt-0.5">{peer.roleLabel}</p>
      </div>

      <div className="px-4 py-3 border-b border-kampmax-border text-xs text-kampmax-text-secondary space-y-2">
        {peer.isVendor && peer.vendor && (
          <p className="text-sm text-kampmax-text">{peer.vendor.description}</p>
        )}
        {peer.user && !peer.isVendor && (
          <p className="text-sm text-kampmax-text">
            {[peer.user.department, peer.user.level].filter(Boolean).join(" \u00b7 ")}
          </p>
        )}
        {campus && <p className="text-xs">{campus.name}</p>}
      </div>

      {peer.isVendor && peer.vendor && (
        <div className="px-4 py-3 border-b border-kampmax-border">
          <p className="text-[10px] font-semibold text-kampmax-text-secondary uppercase mb-2">
            Store info
          </p>
          <div className="space-y-2 text-xs text-kampmax-text">
            <p className="flex items-center gap-1">
              Rating: <strong>{peer.vendor.rating.toFixed(1)}</strong> / 5
            </p>
            <p>Specialties: {peer.vendor.specialties.join(", ")}</p>
          </div>
        </div>
      )}

      <div className="px-4 py-3">
        <p className="text-[10px] font-semibold text-kampmax-text-secondary uppercase mb-2">
          Conversation
        </p>
        <p className="text-xs text-kampmax-text">Started {formatDate(conversation.createdAt)}</p>
        {relatedProduct && (
          <p className="text-xs text-kampmax-text-secondary mt-1">
            Related product: <span className="text-kampmax-text">{relatedProduct.title}</span>
          </p>
        )}
      </div>
    </div>
  );
}