"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ServiceShareButtonProps {
  serviceId: string;
  serviceName: string;
}

/**
 * Share a service via its public URL. Uses the native share sheet when
 * available and falls back to copying the link. Never exposes internal IDs.
 */
export function ServiceShareButton({ serviceId, serviceName }: ServiceShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/services/${serviceId}`
      : `/services/${serviceId}`;

  async function handleShare() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: serviceName, url });
        return;
      }
    } catch {
      // user cancelled — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Share ${serviceName}`}
      className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-md border border-neutral-300 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-success-600" />
          <span>Link copied</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}