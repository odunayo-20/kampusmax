import { Conversation, Message } from "@/types";

export const messages: Message[] = [
  { id: "m1", conversationId: "conv1", senderId: "u1", text: "Hello! Is the HP Laptop still available?", createdAt: "2025-01-14T10:00:00Z", read: true },
  { id: "m2", conversationId: "conv1", senderId: "u3", text: "Yes it is! Would you like to see more photos?", createdAt: "2025-01-14T10:05:00Z", read: true },
  { id: "m3", conversationId: "conv1", senderId: "u1", text: "Yes please. Also, can you do 170k?", createdAt: "2025-01-14T10:12:00Z", read: true },
  { id: "m4", conversationId: "conv1", senderId: "u3", text: "I can do 175k since it comes with the charger and the battery is still strong.", createdAt: "2025-01-14T10:15:00Z", read: true },
  { id: "m4b", conversationId: "conv1", senderId: "u1", text: "Deal! I'll transfer now. What's your account details?", createdAt: "2025-01-14T10:20:00Z", read: false },

  { id: "m5", conversationId: "conv2", senderId: "u1", text: "Hi! The Nike sneakers are authentic right?", createdAt: "2025-01-13T16:00:00Z", read: true },
  { id: "m6", conversationId: "conv2", senderId: "u2", text: "Yes! Bought them from the Nike store in Lagos. I have the receipt too.", createdAt: "2025-01-13T16:10:00Z", read: true },
  { id: "m6b", conversationId: "conv2", senderId: "u1", text: "Can I see the receipt?", createdAt: "2025-01-13T16:12:00Z", read: true },
  { id: "m6c", conversationId: "conv2", senderId: "u2", text: "", createdAt: "2025-01-13T16:13:00Z", read: true, imageUrl: "/placeholder-product.svg" },
  { id: "m7", conversationId: "conv2", senderId: "u1", text: "Great! I'll come check them out at the Student Union Building tomorrow.", createdAt: "2025-01-13T16:15:00Z", read: true },
  { id: "m7b", conversationId: "conv2", senderId: "u2", text: "Sure! I'll be there from 2pm. I'll bring them along.", createdAt: "2025-01-13T16:18:00Z", read: true },
  { id: "m7c", conversationId: "conv2", senderId: "u1", text: "Perfect, see you then!", createdAt: "2025-01-13T16:20:00Z", read: true },

  { id: "m8", conversationId: "conv3", senderId: "u5", text: "Your jollof rice order is being prepared! It'll be ready in 15 minutes.", createdAt: "2025-01-15T12:30:00Z", read: false },
  { id: "m8b", conversationId: "conv3", senderId: "u1", text: "Great! I'm at the Engineering Block. Can you deliver there?", createdAt: "2025-01-15T12:32:00Z", read: true },
  { id: "m8c", conversationId: "conv3", senderId: "u5", text: "Yes! Delivery is free within campus. I'll send the rider now.", createdAt: "2025-01-15T12:33:00Z", read: false },
  { id: "m8d", conversationId: "conv3", senderId: "u5", text: "", createdAt: "2025-01-15T12:35:00Z", read: false, sharedOrder: { id: "KMP-4201", status: "preparing", items: "2x Jollof Rice, 1x Chicken", total: 4500 } },
  { id: "m8e", conversationId: "conv3", senderId: "u5", text: "Order update: rider is on the way! ETA 5 mins.", createdAt: "2025-01-15T12:45:00Z", read: false },

  { id: "m9", conversationId: "conv4", senderId: "u1", text: "Do you have the Casio FX-991ES Plus in stock?", createdAt: "2025-01-12T09:00:00Z", read: true },
  { id: "m10", conversationId: "conv4", senderId: "u3", text: "Yes! We have 8 in stock. 12,000 each.", createdAt: "2025-01-12T09:02:00Z", read: true },
  { id: "m11", conversationId: "conv4", senderId: "u1", text: "Nice. Can I pick up at the Main Gate?", createdAt: "2025-01-12T09:05:00Z", read: true },
  { id: "m12", conversationId: "conv4", senderId: "u3", text: "Of course! Just send me a message when you're here and I'll bring it out.", createdAt: "2025-01-12T09:07:00Z", read: true },
  { id: "m13", conversationId: "conv4", senderId: "u1", text: "", createdAt: "2025-01-12T09:10:00Z", read: true, sharedProduct: { id: "vp3", title: "Casio Scientific Calculator", price: 12000, condition: "New", vendorName: "TechHub Owo" } },
  { id: "m14", conversationId: "conv4", senderId: "u3", text: "That's the one! Come through anytime before 6pm.", createdAt: "2025-01-12T09:12:00Z", read: true },
];

export const conversations: Conversation[] = [
  { id: "conv1", type: "vendor_chat", participants: ["u1", "u3"], lastMessage: messages[4], unreadCount: 2, createdAt: "2025-01-14T10:00:00Z", updatedAt: "2025-01-14T10:20:00Z", vendorId: "v1", productId: "vp2" },
  { id: "conv2", type: "vendor_chat", participants: ["u1", "u2"], lastMessage: messages[11], unreadCount: 0, createdAt: "2025-01-13T16:00:00Z", updatedAt: "2025-01-13T16:20:00Z", vendorId: "v2", productId: "p8" },
  { id: "conv3", type: "vendor_chat", participants: ["u1", "u5"], lastMessage: messages[16], unreadCount: 4, createdAt: "2025-01-15T12:00:00Z", updatedAt: "2025-01-15T12:45:00Z", vendorId: "v3", productId: "p11" },
  { id: "conv4", type: "vendor_chat", participants: ["u1", "u3"], lastMessage: messages[23], unreadCount: 0, createdAt: "2025-01-12T09:00:00Z", updatedAt: "2025-01-12T09:12:00Z", vendorId: "v1" },
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
