"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpfulButtonProps {
  count: number;
  isHelpful: boolean;
  onToggle: () => void;
  className?: string;
}

export function HelpfulButton({ count, isHelpful, onToggle, className }: HelpfulButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
        isHelpful
          ? "bg-kampmax-blue/10 text-kampmax-blue border border-kampmax-blue/20"
          : "bg-kampmax-muted text-kampmax-text-secondary hover:bg-kampmax-muted/80 border border-transparent"
      )}
    >
      <ThumbsUp className={cn("h-3.5 w-3.5", isHelpful && "fill-kampmax-blue")} />
      <span>Helpful{count > 0 ? ` (${count})` : ""}</span>
    </button>
  );
}
