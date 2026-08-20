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
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getConversationById(id: string): Conversation | undefined {
  return _getConversationById(id);
}

export function getMessages(conversationId: string): Message[] {
  return _getMessagesByConversation(conversationId).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Message {
  const newMessage: Message = {
    id: `m${mockMessages.length + 1}`,
    conversationId,
    senderId,
    text,
    createdAt: new Date().toISOString(),
    read: false,
  };
  mockMessages.push(newMessage);

  const conv = mockConversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessage = newMessage;
    conv.updatedAt = newMessage.createdAt;
  }

  return newMessage;
}

export function getTotalUnreadCount(userId: string): number {
  return _getConversationsByUser(userId).reduce(
    (sum, c) => sum + c.unreadCount,
    0
  );
}
