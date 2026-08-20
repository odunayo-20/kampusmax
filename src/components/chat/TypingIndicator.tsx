"use client";

import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  name: string;
}

export function TypingIndicator({ name }: TypingIndicatorProps) {
  return (
    <div className="flex items-end gap-2 mb-2">
      <div className="bg-white border border-kampmax-border rounded-2xl rounded-bl-md px-4 py-3 max-w-[120px]">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-kampmax-text-secondary/40 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-kampmax-text-secondary/40 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-kampmax-text-secondary/40 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
