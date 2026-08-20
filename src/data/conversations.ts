import { Conversation, Message } from "@/types";

export const messages: Message[] = [
  {
    id: "m1",
    conversationId: "conv1",
    senderId: "u3",
    text: "Hello! Is the HP Laptop still available?",
    createdAt: "2025-01-14T10:00:00Z",
    read: true,
  },
  {
    id: "m2",
    conversationId: "conv1",
    senderId: "u1",
    text: "Yes, it is! Would you like to see more photos?",
    createdAt: "2025-01-14T10:05:00Z",
    read: true,
  },
  {
    id: "m3",
    conversationId: "conv1",
    senderId: "u3",
    text: "Yes please. Also, can you do 170k?",
    createdAt: "2025-01-14T10:12:00Z",
    read: true,
  },
  {
    id: "m4",
    conversationId: "conv1",
    senderId: "u1",
    text: "I can do 175k since it comes with the charger and the battery is still strong.",
    createdAt: "2025-01-14T10:15:00Z",
    read: false,
  },
  {
    id: "m5",
    conversationId: "conv2",
    senderId: "u2",
    text: "Hi! The Nike sneakers are authentic, right?",
    createdAt: "2025-01-13T16:00:00Z",
    read: true,
  },
  {
    id: "m6",
    conversationId: "conv2",
    senderId: "u1",
    text: "Yes! Bought them from the Nike store in Lagos. I have the receipt too.",
    createdAt: "2025-01-13T16:10:00Z",
    read: true,
  },
  {
    id: "m7",
    conversationId: "conv2",
    senderId: "u2",
    text: "Great! I'll come check them out at the Student Union Building tomorrow.",
    createdAt: "2025-01-13T16:15:00Z",
    read: true,
  },
  {
    id: "m8",
    conversationId: "conv3",
    senderId: "u5",
    text: "Your jollof rice order is being prepared! It'll be ready in 15 minutes.",
    createdAt: "2025-01-15T12:30:00Z",
    read: false,
  },
];

export const conversations: Conversation[] = [
  {
    id: "conv1",
    type: "direct",
    participants: ["u1", "u3"],
    lastMessage: messages[3],
    unreadCount: 1,
    createdAt: "2025-01-14T10:00:00Z",
    updatedAt: "2025-01-14T10:15:00Z",
  },
  {
    id: "conv2",
    type: "direct",
    participants: ["u1", "u2"],
    lastMessage: messages[6],
    unreadCount: 0,
    createdAt: "2025-01-13T16:00:00Z",
    updatedAt: "2025-01-13T16:15:00Z",
  },
  {
    id: "conv3",
    type: "vendor_chat",
    participants: ["u1", "u5"],
    lastMessage: messages[7],
    unreadCount: 1,
    createdAt: "2025-01-15T12:00:00Z",
    updatedAt: "2025-01-15T12:30:00Z",
    vendorId: "v3",
    productId: "p11",
  },
];

export function getConversationsByUser(userId: string): Conversation[] {
  return conversations.filter((c) => c.participants.includes(userId));
}

export function getConversationById(id: string): Conversation | undefined {
  return conversations.find((c) => c.id === id);
}

export function getMessagesByConversation(conversationId: string): Message[] {
  return messages.filter((m) => m.conversationId === conversationId);
}
