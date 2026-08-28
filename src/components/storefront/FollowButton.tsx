"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BellPlus, BellRing } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/atoms/Button";
import {
  isFollowing,
  followVendor,
  unfollowVendor,
} from "@/services/storefront";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  vendorId: string;
  storeSlug: string;
  className?: string;
}

type FollowState = "loading" | "idle" | "following" | "error";

/**
 * Auth-aware "Follow Store" button.
 *
 * - Unauthenticated visitors are redirected through the existing login flow
 *   with a `returnTo` back to this storefront (no navigation context lost).
 * - Shows loading / success / error states and never silently fails.
 */
export function FollowButton({ vendorId, storeSlug, className }: FollowButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user } = useAuth();

  const [localState, setLocalState] = useState<FollowState>("idle");
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && user) {
      setFollowing(isFollowing(vendorId, user.id));
    }
  }, [status, user, vendorId]);

  function handleClick() {
    // Require authentication; deep-link back to this store after login.
    if (status !== "authenticated" || !user) {
      const returnTo = pathname || `/store/${storeSlug}`;
      router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    setLocalState("loading");
    try {
      if (following) {
        unfollowVendor(vendorId, user.id);
        setFollowing(false);
      } else {
        followVendor(vendorId, user.id);
        setFollowing(true);
      }
      setLocalState("idle");
    } catch {
      setLocalState("error");
      setTimeout(() => setLocalState("idle"), 2500);
    }
  }

  const busy = localState === "loading";

  return (
    <Button
      onClick={handleClick}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-1.5",
        following
          ? "bg-kampmax-muted text-kampmax-text hover:bg-kampmax-muted/70 border border-kampmax-border"
          : "bg-kampmax-navy text-white hover:bg-kampmax-navy-light",
        className
      )}
      aria-pressed={following}
      aria-label={following ? `Unfollow ${storeSlug} store` : `Follow ${storeSlug} store`}
    >
      {busy ? (
        <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : following ? (
        <BellRing className="h-4 w-4" />
      ) : (
        <BellPlus className="h-4 w-4" />
      )}
      <span>
        {busy
          ? "Working..."
          : localState === "error"
            ? "Try again"
            : following
              ? "Following"
              : "Follow Store"}
      </span>
    </Button>
  );
}
