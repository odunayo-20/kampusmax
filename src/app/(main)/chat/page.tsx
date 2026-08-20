"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MessageCircle, Store, X, Pin, BellOff, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuth } from "@/lib/auth-context";
import {
  getConversations,
  getTotalUnreadCount,
  markAllAsRead,
} from "@/services/messages";
import { getVendorByUserId, getUserById } from "@/services/users";
import { Conversation } from "@/types";

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString("en-NG", { weekday: "short" });
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

export default function ChatListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "vendors" | "students">("all");

  if (!user) return null;

  const userId = user.id;
  const conversations = getConversations(userId);
  const totalUnread = getTotalUnreadCount(userId);

  const filtered = conversations.filter((c) => {
    const otherId = c.participants.find((p) => p !== userId) || "";
    const otherUser = getUserById(otherId);
    const otherVendor = getVendorByUserId(otherId);
    const name = otherVendor?.storeName || otherUser?.name || "";
    const matchesSearch = !search || name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage?.text.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      tab === "all" ||
      (tab === "vendors" && c.type === "vendor_chat") ||
      (tab === "students" && c.type === "direct");
    return matchesSearch && matchesTab;
  });

  function getConvName(c: Conversation) {
    const otherId = c.participants.find((p) => p !== userId) || "";
    const vendor = getVendorByUserId(otherId);
    if (vendor) return vendor.storeName;
    const u = getUserById(otherId);
    return u?.name || "Unknown";
  }

  function getConvSubtitle(c: Conversation) {
    if (c.type === "vendor_chat") return "Vendor";
    return "Student";
  }

  return (
    <PageContainer className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-kampmax-text">Messages</h1>
          {totalUnread > 0 && (
            <p className="text-xs text-kampmax-text-secondary">
              {totalUnread} unread message{totalUnread > 1 ? "s" : ""}
            </p>
          )}
        </div>
        {totalUnread > 0 && (
          <button
            onClick={() => markAllAsRead(userId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-kampmax-blue bg-kampmax-blue/10"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kampmax-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kampmax-border text-sm bg-white focus:outline-none focus:border-kampmax-blue"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-kampmax-text-secondary" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["all", "vendors", "students"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              tab === t
                ? "bg-kampmax-navy text-white"
                : "bg-white text-kampmax-text-secondary border border-kampmax-border"
            )}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-kampmax-border p-12 text-center">
          <MessageCircle className="h-12 w-12 text-kampmax-text-secondary/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-kampmax-text">
            {search ? "No conversations found" : "No messages yet"}
          </p>
          <p className="text-xs text-kampmax-text-secondary mt-1">
            {search
              ? "Try a different search term"
              : "Start a conversation from a product page or vendor profile"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-kampmax-border divide-y divide-kampmax-border overflow-hidden">
          {filtered.map((conv) => {
            const name = getConvName(conv);
            const subtitle = getConvSubtitle(conv);
            const lastMsg = conv.lastMessage;
            const isVendor = conv.type === "vendor_chat";

            return (
              <button
                key={conv.id}
                onClick={() => router.push(`/chat/${conv.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-kampmax-muted/50 active:bg-kampmax-muted transition-colors"
              >
                {/* Avatar */}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm",
                  isVendor ? "bg-kampmax-gold text-kampmax-navy" : "bg-kampmax-navy"
                )}>
                  {isVendor ? (
                    <Store className="h-5 w-5" />
                  ) : (
                    name.charAt(0)
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn(
                      "text-sm font-semibold truncate",
                      conv.unreadCount > 0 ? "text-kampmax-text" : "text-kampmax-text"
                    )}>
                      {name}
                    </span>
                    {isVendor && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-kampmax-gold/10 text-kampmax-gold font-semibold flex-shrink-0">
                        VENDOR
                      </span>
                    )}
                    {conv.isPinned && (
                      <Pin className="h-3 w-3 text-kampmax-text-secondary/40 flex-shrink-0" />
                    )}
                    {conv.isMuted && (
                      <BellOff className="h-3 w-3 text-kampmax-text-secondary/40 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-kampmax-text-secondary truncate">
                    {lastMsg?.text || lastMsg?.sharedProduct ? (
                      <>
                        {lastMsg.senderId === userId && (
                          <span className="text-kampmax-text-secondary/60">You: </span>
                        )}
                        {lastMsg.sharedProduct
                          ? `Shared: ${lastMsg.sharedProduct.title}`
                          : lastMsg.sharedOrder
                            ? `Order: ${lastMsg.sharedOrder.id}`
                            : lastMsg.text}
                      </>
                    ) : (
                      <span className="italic">No messages yet</span>
                    )}
                  </p>
                </div>

                {/* Time + Badge */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {lastMsg && (
                    <span className={cn(
                      "text-[10px]",
                      conv.unreadCount > 0 ? "text-kampmax-blue font-semibold" : "text-kampmax-text-secondary/60"
                    )}>
                      {formatTime(lastMsg.createdAt)}
                    </span>
                  )}
                  {conv.unreadCount > 0 && (
                    <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-kampmax-blue text-white text-[10px] font-bold px-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
