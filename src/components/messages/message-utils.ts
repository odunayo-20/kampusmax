import { Conversation } from "@/types";
import { getUserById, getVendorByUserId } from "@/services/users";

export interface ConversationPeer {
  id: string;
  name: string;
  isVendor: boolean;
  roleLabel: string;
  vendor?: ReturnType<typeof getVendorByUserId>;
  user?: ReturnType<typeof getUserById>;
}

/**
 * Resolves the other participant in a one-to-one conversation. Only public
 * profile data is exposed (store name / user name) — never email or phone.
 */
export function getConversationPeer(
  userId: string,
  conversation: Conversation
): ConversationPeer {
  const peerId = conversation.participants.find((p) => p !== userId) ?? "";
  const vendor = peerId ? getVendorByUserId(peerId) : undefined;
  const user = peerId ? getUserById(peerId) : undefined;
  const isVendor = conversation.type === "vendor_chat" || !!vendor;
  return {
    id: peerId,
    name: vendor?.storeName || user?.name || "Unknown",
    isVendor,
    roleLabel: isVendor ? "Vendor" : "Student",
    vendor,
    user,
  };
}

export function getConversationSnippet(
  conversation: Conversation,
  currentUserId: string
): string {
  const last = conversation.lastMessage;
  if (!last) return "No messages yet";
  const prefix = last.senderId === currentUserId ? "You: " : "";
  if (last.sharedProduct) return `${prefix}Shared a product`;
  if (last.sharedOrder) return `${prefix}Shared an order`;
  if (last.imageUrl) return `${prefix}[Photo]`;
  const text = last.text || "No messages yet";
  return `${prefix}${text}`;
}

export function formatConversationTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) {
    return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  }
  if (days === 1) return "Yesterday";
  if (days < 7) {
    return d.toLocaleDateString("en-NG", { weekday: "short" });
  }
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

export function formatConversationDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  preparing: "Being prepared",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status.toLowerCase()] ?? "Order update";
}