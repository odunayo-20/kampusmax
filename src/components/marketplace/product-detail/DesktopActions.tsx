"use client";

import { useState } from "react";
import { Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DesktopActionsProps {
  initialLiked?: boolean;
  onLikeToggle?: (liked: boolean) => void;
  onShare?: () => void;
}

export function DesktopActions({ initialLiked = false, onLikeToggle, onShare }: DesktopActionsProps) {
  const [liked, setLiked] = useState(initialLiked);

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    onLikeToggle?.(next);
  };

  return (
    <div className="hidden lg:flex items-center justify-end gap-1">
      <button
        onClick={handleLike}
        aria-pressed={liked}
        className={cn(
          "h-9 w-9 flex items-center justify-center rounded-full border transition-colors",
          liked ? "bg-error-50 border-error-100 text-error-600" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
        )}
      >
        <Heart className={cn("h-4 w-4", liked && "fill-error-600")} />
      </button>
      <button
        onClick={onShare}
        className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}