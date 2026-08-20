"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Phone, MoreVertical, Store, ShoppingBag,
  Info, Package, X, Search,
} from "lucide-react";
import { cn, formatNaira } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  getConversationById,
  getMessages,
  sendMessage,
  markAsRead,
} from "@/services/messages";
import { getVendorByUserId, getUserById } from "@/services/users";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ChatInput } from "@/components/chat/ChatInput";
import { getVendorProducts } from "@/services/vendor";
import { getOrdersByUser } from "@/services/orders";

export default function ChatScreenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversation, setConversation] = useState(getConversationById(id));
  const [messages, setMessages] = useState(getMessages(id));
  const [isTyping, setIsTyping] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showOrderPicker, setShowOrderPicker] = useState(false);

  useEffect(() => {
    if (!user) return;
    markAsRead(id, user.id);
    setConversation(getConversationById(id));
  }, [id, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!user || !conversation) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-sm text-kampmax-text-secondary">Conversation not found</p>
      </div>
    );
  }

  const otherId = conversation.participants.find((p) => p !== user!.id) || "";
  const otherVendor = getVendorByUserId(otherId);
  const otherUser = getUserById(otherId);
  const otherName = otherVendor?.storeName || otherUser?.name || "Unknown";
  const isVendor = conversation.type === "vendor_chat";
  const userId = user!.id;

  const vendorProducts = isVendor ? getVendorProducts().slice(0, 4) : [];
  const userOrders = getOrdersByUser(userId).slice(0, 4);

  function handleSend(text: string) {
    if (!user) return;
    const newMsg = sendMessage(id, userId, text);
    setMessages(getMessages(id));
    setConversation(getConversationById(id));

    // Simulate typing + reply
    if (isVendor) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replies = [
          "Thanks for your message! Let me check on that.",
          "Sure thing! I'll get back to you shortly.",
          "Noted! Is there anything else you need?",
          "Okay! I'll have that ready for you.",
        ];
        sendMessage(id, otherId, replies[Math.floor(Math.random() * replies.length)]);
        setMessages(getMessages(id));
        setConversation(getConversationById(id));
      }, 1500 + Math.random() * 2000);
    }
  }

  function handleShareProduct(product: { id: string; title: string; price: number; condition: string }) {
    sendMessage(id, userId, "", {
      sharedProduct: {
        id: product.id,
        title: product.title,
        price: product.price,
        condition: product.condition as "New" | "Used" | "Fair",
        vendorName: otherVendor?.storeName,
      },
    });
    setMessages(getMessages(id));
    setConversation(getConversationById(id));
    setShowProductPicker(false);
  }

  function handleShareOrder(order: { id: string; status: string; total: number }) {
    sendMessage(id, userId, "", {
      sharedOrder: {
        id: order.id,
        status: order.status as any,
        items: `Order ${order.id}`,
        total: order.total,
      },
    });
    setMessages(getMessages(id));
    setConversation(getConversationById(id));
    setShowOrderPicker(false);
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: typeof messages }[] = [];
  messages.forEach((msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString("en-NG", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      groupedMessages.push({ date, messages: [msg] });
    }
  });

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen bg-kampmax-bg">
      {/* Header */}
      <div className="bg-kampmax-navy px-3 py-2.5 flex items-center gap-3 flex-shrink-0 z-10">
        <button onClick={() => router.push("/chat")} className="text-white/70 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm",
          isVendor ? "bg-kampmax-gold text-kampmax-navy" : "bg-white/10 text-white"
        )}>
          {isVendor ? <Store className="h-5 w-5" /> : otherName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{otherName}</p>
          <p className="text-[11px] text-white/50">
            {isVendor ? "Vendor" : "Student"}
          </p>
        </div>
        <button onClick={() => setShowInfo(!showInfo)} className="text-white/70 hover:text-white">
          <Info className="h-5 w-5" />
        </button>
      </div>

      {/* Main area */}
      <div className="flex-1 flex min-h-0">
        {/* Messages */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="bg-kampmax-navy/10 text-kampmax-text-secondary text-[11px] font-medium px-3 py-1 rounded-full">
                    {group.date}
                  </span>
                </div>
                {group.messages.map((msg, i) => {
                  const isMine = msg.senderId === userId;
                  const nextMsg = group.messages[i + 1];
                  const showTail = !nextMsg || nextMsg.senderId !== msg.senderId;
                  return (
                    <MessageBubble key={msg.id} message={msg} isMine={isMine} showTail={showTail} />
                  );
                })}
              </div>
            ))}
            {isTyping && <TypingIndicator name={otherName} />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput
            onSend={handleSend}
            onImageAttach={() => {}}
            onProductShare={() => setShowProductPicker(true)}
            onOrderShare={() => setShowOrderPicker(true)}
          />
        </div>

        {/* Info Panel (desktop) */}
        {showInfo && (
          <div className="hidden lg:block w-72 border-l border-kampmax-border bg-white overflow-y-auto flex-shrink-0">
            <div className="p-4 text-center border-b border-kampmax-border">
              <div className={cn(
                "w-16 h-16 rounded-full mx-auto flex items-center justify-center font-bold text-lg mb-2",
                isVendor ? "bg-kampmax-gold text-kampmax-navy" : "bg-kampmax-navy text-white"
              )}>
                {isVendor ? <Store className="h-7 w-7" /> : otherName.charAt(0)}
              </div>
              <p className="text-sm font-bold text-kampmax-text">{otherName}</p>
              <p className="text-xs text-kampmax-text-secondary">
                {isVendor ? otherVendor?.description?.slice(0, 80) : otherUser?.department || "Student"}
              </p>
            </div>
            {isVendor && otherVendor && (
              <div className="p-4 border-b border-kampmax-border">
                <p className="text-[10px] font-semibold text-kampmax-text-secondary uppercase mb-2">Store Info</p>
                <div className="space-y-2 text-xs text-kampmax-text">
                  <p>Rating: {"⭐".repeat(Math.round(otherVendor.rating))} {otherVendor.rating}</p>
                  <p>Specialties: {otherVendor.specialties.join(", ")}</p>
                </div>
              </div>
            )}
            <div className="p-4">
              <p className="text-[10px] font-semibold text-kampmax-text-secondary uppercase mb-2">Shared Media</p>
              <p className="text-xs text-kampmax-text-secondary">No shared media yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl max-h-[70vh] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-kampmax-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-kampmax-text">Share a Product</h3>
              <button onClick={() => setShowProductPicker(false)}><X className="h-5 w-5 text-kampmax-text-secondary" /></button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-kampmax-border">
              {vendorProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleShareProduct(p)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-kampmax-muted/50"
                >
                  <div className="w-12 h-12 rounded-lg bg-kampmax-muted flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-kampmax-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-kampmax-text truncate">{p.title}</p>
                    <p className="text-xs text-kampmax-text-secondary">{p.condition}</p>
                  </div>
                  <span className="text-sm font-bold text-kampmax-blue">{formatNaira(p.price)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Order Picker Modal */}
      {showOrderPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl max-h-[70vh] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-kampmax-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-kampmax-text">Share an Order</h3>
              <button onClick={() => setShowOrderPicker(false)}><X className="h-5 w-5 text-kampmax-text-secondary" /></button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-kampmax-border">
              {userOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingBag className="h-8 w-8 text-kampmax-text-secondary mx-auto mb-2" />
                  <p className="text-xs text-kampmax-text-secondary">No orders to share</p>
                </div>
              ) : (
                userOrders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => handleShareOrder(o)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-kampmax-muted/50"
                  >
                    <div className="w-12 h-12 rounded-lg bg-kampmax-blue/10 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="h-5 w-5 text-kampmax-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-kampmax-text">{o.id}</p>
                      <p className="text-xs text-kampmax-text-secondary capitalize">{o.status.replace("_", " ")}</p>
                    </div>
                    <span className="text-sm font-bold text-kampmax-text">{formatNaira(o.total)}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
