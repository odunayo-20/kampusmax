"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/atoms/Button";

interface ShareStoreButtonProps {
  storeSlug: string;
  storeName: string;
}

/**
 * Share the store using the canonical public URL (keeps the public slug, never
 * exposes internal IDs). Falls back to copying the link to the clipboard, and
 * uses the native share sheet where available.
 */
export function ShareStoreButton({ storeSlug, storeName }: ShareStoreButtonProps) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/store/${storeSlug}`
      : `/store/${storeSlug}`;

  async function handleShare() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: storeName, url });
        return;
      }
    } catch {
      // user cancelled native share — fall through to clipboard
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
    <Button
      variant="outline"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5"
      aria-label={`Share ${storeName}`}
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
    </Button>
  );
}
