"use client";

import { cn } from "@/lib/utils";
import { CampusAnnouncement as AnnType } from "@/types";
import { AlertTriangle, Info, Megaphone } from "lucide-react";

interface CampusAnnouncementProps {
  announcement: AnnType;
  compact?: boolean;
}

const priorityConfig = {
  info: {
    icon: Info,
    bg: "bg-kampmax-blue/5",
    border: "border-kampmax-blue/20",
    iconColor: "text-kampmax-blue",
    badge: "bg-kampmax-blue/10 text-kampmax-blue",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-kampmax-gold/5",
    border: "border-kampmax-gold/30",
    iconColor: "text-kampmax-gold",
    badge: "bg-kampmax-gold/10 text-kampmax-navy",
    label: "Warning",
  },
  urgent: {
    icon: Megaphone,
    bg: "bg-kampmax-error/10",
    border: "border-kampmax-error/20",
    iconColor: "text-kampmax-error",
    badge: "bg-kampmax-error/20 text-kampmax-error",
    label: "Urgent",
  },
};

export function CampusAnnouncementCard({ announcement, compact }: CampusAnnouncementProps) {
  const config = priorityConfig[announcement.priority];
  const Icon = config.icon;
  const isExpired = new Date(announcement.expiresAt) < new Date();

  if (isExpired && compact) return null;

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        config.bg,
        config.border
      )}
    >
      <div className={cn(compact ? "p-3" : "p-4")}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("h-4 w-4", config.iconColor)} />
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
            config.badge
          )}>
            {config.label} · Announcement
          </span>
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-bold text-kampmax-text mb-1",
          compact ? "text-sm" : "text-base"
        )}>
          {announcement.title}
        </h3>

        {/* Content */}
        <p className={cn(
          "text-kampmax-text-secondary leading-relaxed",
          compact ? "text-xs" : "text-sm"
        )}>
          {announcement.content}
        </p>
      </div>

      {/* Footer */}
      {!compact && (
        <div className="px-4 py-2 border-t border-kampmax-border/50 flex items-center justify-between">
          <span className="text-[10px] text-kampmax-text-secondary">
            Posted {new Date(announcement.createdAt).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className={cn("text-[10px] font-medium", config.iconColor)}>
            Expires {new Date(announcement.expiresAt).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      )}
    </div>
  );
}
