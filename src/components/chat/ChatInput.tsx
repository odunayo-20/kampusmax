"use client";

import { useState, useRef } from "react";
import { Send, Camera, Package, ShoppingCart, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (text: string) => void;
  onImageAttach?: () => void;
  onProductShare?: () => void;
  onOrderShare?: () => void;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onImageAttach,
  onProductShare,
  onOrderShare,
  disabled,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [showAttach, setShowAttach] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    setShowAttach(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const attachItems = [
    { icon: Camera, label: "Photo", onClick: onImageAttach },
    { icon: Package, label: "Product", onClick: onProductShare },
    { icon: ShoppingCart, label: "Order", onClick: onOrderShare },
  ];

  return (
    <div className="relative bg-white border-t border-kampmax-border">
      {/* Attach Menu */}
      {showAttach && (
        <div className="absolute bottom-full left-0 right-0 bg-white border-t border-kampmax-border px-4 py-3 flex gap-4">
          {attachItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onClick?.();
                setShowAttach(false);
              }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-10 h-10 rounded-full bg-kampmax-blue/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-kampmax-blue" />
              </div>
              <span className="text-[10px] text-kampmax-text-secondary font-medium">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2 px-3 py-2">
        <button
          onClick={() => setShowAttach(!showAttach)}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
            showAttach ? "bg-kampmax-blue text-white" : "bg-kampmax-muted text-kampmax-text-secondary"
          )}
        >
          <Smile className="h-5 w-5" />
        </button>

        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none rounded-2xl border border-kampmax-border bg-kampmax-muted/50 px-4 py-2.5 text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/60 focus:outline-none focus:border-kampmax-blue focus:bg-white max-h-24 transition-colors"
          style={{ minHeight: "42px" }}
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
            text.trim()
              ? "bg-kampmax-blue text-white"
              : "bg-kampmax-muted text-kampmax-text-secondary"
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
