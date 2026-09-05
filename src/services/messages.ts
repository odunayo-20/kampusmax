import { Conversation, Message } from "@/types";
import { getUserById, getVendorByUserId } from "@/services/users";
import {
  getConversationsByUser as _getConversationsByUser,
  getConversationById as _getConversationById,
  getMessagesByConversation as _getMessagesByConversation,
  sendMessageRecord,
  markConversationReadRecord,
  markAllMessagesReadRecord,
} from "@/data/conversations";

function byNewest(a: Conversation, b: Conversation): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

function byOldest(a: Message, b: Message): number {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

export function getConversations(userId: string): Conversation[] {
  return _getConversationsByUser(userId).sort(byNewest);
}

/**
 * Authorized single-conversation lookup. Membership is verified first,
 * mirroring the backend rule that a user can only receive conversations they
 * belong to (IDOR/BOLA-safe). A non-existent and an inaccessible conversation
 * are deliberately indistinguishable: both return undefined so the UI can
 * show a neutral "unavailable" state without revealing other users' messages.
 */
export function getConversationForUser(
  id: string,
  userId: string
): Conversation | undefined {
  const conversation = _getConversationById(id);
  if (!conversation) return undefined;
  if (!conversation.participants.includes(userId)) return undefined;
  return conversation;
}

export function getConversationById(id: string): Conversation | undefined {
  return _getConversationById(id);
}

export function getMessages(conversationId: string): Message[] {
  return _getMessagesByConversation(conversationId).sort(byOldest);
}

export function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  extra?: Partial<Message>
): Message {
  return sendMessageRecord(conversationId, senderId, text, extra);
}

export function markAsRead(conversationId: string, userId: string): void {
  markConversationReadRecord(conversationId, userId);
}

export function markAllAsRead(userId: string): void {
  markAllMessagesReadRecord(userId);
}

export function getTotalUnreadCount(userId: string): number {
  return _getConversationsByUser(userId).reduce((sum, c) => sum + c.unreadCount, 0);
}

export function searchConversations(userId: string, query: string): Conversation[] {
  const q = query.trim().toLowerCase();
  const all = getConversations(userId);
  if (!q) return all;

  return all.filter((c) => {
    if (c.lastMessage?.text.toLowerCase().includes(q)) return true;
    const peerId = c.participants.find((p) => p !== userId);
    if (!peerId) return false;
    const vendor = getVendorByUserId(peerId);
    if (vendor?.storeName.toLowerCase().includes(q)) return true;
    const user = getUserById(peerId);
    return user?.name.toLowerCase().includes(q) ?? false;
  });
}