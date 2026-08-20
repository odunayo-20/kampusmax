import { Conversation, Message } from "@/types";
import {
  conversations as mockConversations,
  messages as mockMessages,
  getConversationsByUser as _getConversationsByUser,
  getConversationById as _getConversationById,
  getMessagesByConversation as _getMessagesByConversation,
} from "@/data/conversations";

export function getConversations(userId: string): Conversation[] {
  return _getConversationsByUser(userId).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getConversationById(id: string): Conversation | undefined {
  return _getConversationById(id);
}

export function getMessages(conversationId: string): Message[] {
  return _getMessagesByConversation(conversationId).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  extra?: Partial<Message>
): Message {
  const newMessage: Message = {
    id: `m${Date.now()}`,
    conversationId,
    senderId,
    text,
    createdAt: new Date().toISOString(),
    read: false,
    ...extra,
  };
  mockMessages.push(newMessage);

  const conv = mockConversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessage = newMessage;
    conv.updatedAt = newMessage.createdAt;
  }

  return newMessage;
}

export function markAsRead(conversationId: string, userId: string): void {
  mockMessages
    .filter((m) => m.conversationId === conversationId && m.senderId !== userId && !m.read)
    .forEach((m) => { m.read = true; });

  const conv = mockConversations.find((c) => c.id === conversationId);
  if (conv) conv.unreadCount = 0;
}

export function markAllAsRead(userId: string): void {
  mockConversations
    .filter((c) => c.participants.includes(userId))
    .forEach((c) => { c.unreadCount = 0; });
  mockMessages
    .filter((m) => m.senderId !== userId && !m.read)
    .forEach((m) => { m.read = true; });
}

export function getTotalUnreadCount(userId: string): number {
  return _getConversationsByUser(userId).reduce(
    (sum, c) => sum + c.unreadCount, 0
  );
}

export function searchConversations(userId: string, query: string): Conversation[] {
  const q = query.toLowerCase();
  return getConversations(userId).filter((c) => {
    if (c.lastMessage?.text.toLowerCase().includes(q)) return true;
    return false;
  });
}

export function simulateTyping(): boolean {
  return Math.random() > 0.5;
}
