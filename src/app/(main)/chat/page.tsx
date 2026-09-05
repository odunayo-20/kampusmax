"use client";

import { MessageCircle } from "lucide-react";
import { ConversationList } from "@/components/messages/ConversationList";

/**
 * Messaging inbox. On desktop this is the classic two-panel layout: the
 * conversation list with a "select a conversation" empty state; on mobile the
 * list fills the screen above the bottom navigation. The thread opens at
 * /chat/:id — the same list re-embeds as the left panel there.
 */
export default function ChatListPage() {
  return (
    <div className="flex h-[calc(100dvh-56px)] lg:h-[calc(100vh-60px)] pb-[64px] lg:pb-0">
      <div className="w-full lg:w-[380px] lg:flex-shrink-0 lg:border-r border-kampmax-border bg-white">
        <ConversationList />
      </div>

      <div className="hidden lg:flex flex-1 flex-col items-center justify-center gap-2 bg-kampmax-bg px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white border border-kampmax-border flex items-center justify-center">
          <MessageCircle className="h-7 w-7 text-kampmax-text-secondary/40" aria-hidden />
        </div>
        <p className="text-sm font-semibold text-kampmax-text">Select a conversation</p>
        <p className="text-xs text-kampmax-text-secondary max-w-xs">
          Pick a conversation to start messaging. You can start a new one from
          any product page or vendor profile.
        </p>
      </div>
    </div>
  );
}