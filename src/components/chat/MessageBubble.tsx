"use client";

import { cn, formatNaira } from "@/lib/utils";
import { Package, ShoppingCart } from "lucide-react";
import { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showTail?: boolean;
}

export function MessageBubble({ message, isMine, showTail }: MessageBubbleProps) {
  const hasContent = message.text || message.imageUrl || message.sharedProduct || message.sharedOrder;
  if (!hasContent) return null;

  return (
    <div className={cn("flex mb-1", isMine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] lg:max-w-[65%] relative",
          isMine ? "order-2" : "order-1"
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            isMine
              ? "bg-kampmax-navy text-white rounded-br-md"
              : "bg-white border border-kampmax-border text-kampmax-text rounded-bl-md",
            showTail && isMine && "rounded-br-md",
            showTail && !isMine && "rounded-bl-md"
          )}
        >
          {/* Image */}
          {message.imageUrl && (
            <div className="mb-2 -mx-1 -mt-0.5">
              <div className="w-full h-40 rounded-lg bg-kampmax-muted flex items-center justify-center overflow-hidden">
                <Package className="h-10 w-10 text-kampmax-text-secondary" />
              </div>
            </div>
          )}

          {/* Shared Product */}
          {message.sharedProduct && (
            <div className={cn(
              "mb-2 -mx-1 -mt-0.5 rounded-lg p-3 border",
              isMine ? "bg-white/10 border-white/20" : "bg-kampmax-muted/50 border-kampmax-border"
            )}>
              <div className="flex items-center gap-2 mb-1.5">
                <Package className={cn("h-3.5 w-3.5", isMine ? "text-white/70" : "text-kampmax-blue")} />
                <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isMine ? "text-white/60" : "text-kampmax-text-secondary")}>
                  Shared Product
                </span>
              </div>
              <p className={cn("text-sm font-semibold", isMine ? "text-white" : "text-kampmax-text")}>
                {message.sharedProduct.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("text-sm font-bold", isMine ? "text-kampmax-gold" : "text-kampmax-blue")}>
                  {formatNaira(message.sharedProduct.price)}
                </span>
                <span className={cn("text-[10px]", isMine ? "text-white/50" : "text-kampmax-text-secondary")}>
                  {message.sharedProduct.condition}
                </span>
              </div>
              {message.sharedProduct.vendorName && (
                <p className={cn("text-[11px] mt-1", isMine ? "text-white/50" : "text-kampmax-text-secondary")}>
                  by {message.sharedProduct.vendorName}
                </p>
              )}
            </div>
          )}

          {/* Shared Order */}
          {message.sharedOrder && (
            <div className={cn(
              "mb-2 -mx-1 -mt-0.5 rounded-lg p-3 border",
              isMine ? "bg-white/10 border-white/20" : "bg-kampmax-muted/50 border-kampmax-border"
            )}>
              <div className="flex items-center gap-2 mb-1.5">
                <ShoppingCart className={cn("h-3.5 w-3.5", isMine ? "text-white/70" : "text-kampmax-blue")} />
                <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isMine ? "text-white/60" : "text-kampmax-text-secondary")}>
                  Order Update
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-medium", isMine ? "text-white/70" : "text-kampmax-text-secondary")}>
                  {message.sharedOrder.id}
                </span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-medium capitalize",
                  isMine ? "bg-white/20 text-white" : "bg-kampmax-blue/10 text-kampmax-blue"
                )}>
                  {message.sharedOrder.status.replace("_", " ")}
                </span>
              </div>
              <p className={cn("text-xs mt-1", isMine ? "text-white/70" : "text-kampmax-text-secondary")}>
                {message.sharedOrder.items}
              </p>
              <p className={cn("text-sm font-bold mt-1", isMine ? "text-kampmax-gold" : "text-kampmax-blue")}>
                {formatNaira(message.sharedOrder.total)}
              </p>
            </div>
          )}

          {/* Text */}
          {message.text && (
            <p className={cn(isMine ? "text-white" : "text-kampmax-text")}>
              {message.text}
            </p>
          )}
        </div>

        {/* Timestamp */}
        <p className={cn(
          "text-[10px] mt-0.5 px-1",
          isMine ? "text-right text-kampmax-text-secondary/60" : "text-left text-kampmax-text-secondary/60"
        )}>
          {new Date(message.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
