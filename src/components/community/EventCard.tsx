"use client";

import { cn } from "@/lib/utils";
import { CampusEvent } from "@/types";
import { CalendarDays, MapPin, Users, Video, Tag } from "lucide-react";

interface CommunityEventCardProps {
  event: CampusEvent;
  onAttend?: () => void;
  isAttending?: boolean;
  compact?: boolean;
}

export function CommunityEventCard({
  event,
  onAttend,
  isAttending,
  compact,
}: CommunityEventCardProps) {
  const spotsLeft = event.maxAttendees
    ? event.maxAttendees - event.attendees.length
    : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  const startDate = new Date(event.startDate);
  const day = startDate.toLocaleDateString("en-NG", { day: "numeric" });
  const month = startDate.toLocaleDateString("en-NG", { month: "short" }).toUpperCase();
  const time = startDate.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={cn(
      "rounded-xl border border-kampmax-border bg-white overflow-hidden",
      compact && "flex"
    )}>
      {/* Date Badge */}
      {compact ? (
        <div className="w-16 flex-shrink-0 bg-kampmax-blue/5 border-r border-kampmax-border flex flex-col items-center justify-center py-3">
          <span className="text-lg font-bold text-kampmax-blue leading-none">{day}</span>
          <span className="text-[9px] font-bold text-kampmax-blue/60">{month}</span>
        </div>
      ) : (
        <div className="h-2 bg-kampmax-blue" />
      )}

      <div className={cn("flex-1", compact ? "p-3" : "p-4")}>
        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {event.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-kampmax-muted text-kampmax-text-secondary font-medium"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className={cn(
          "font-bold text-kampmax-text mb-1",
          compact ? "text-sm" : "text-base"
        )}>
          {event.title}
        </h3>

        {/* Description */}
        <p className={cn(
          "text-kampmax-text-secondary line-clamp-2 mb-3",
          compact ? "text-xs" : "text-sm"
        )}>
          {event.description}
        </p>

        {/* Details */}
        <div className="flex flex-wrap gap-3 text-[11px] text-kampmax-text-secondary mb-3">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {day} {month} · {time}
          </span>
          <span className="flex items-center gap-1">
            {event.isVirtual ? (
              <Video className="h-3.5 w-3.5" />
            ) : (
              <MapPin className="h-3.5 w-3.5" />
            )}
            {event.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {event.attendees.length}
            {event.maxAttendees ? `/${event.maxAttendees}` : ""} attending
          </span>
        </div>

        {/* Action */}
        {onAttend && (
          <button
            onClick={onAttend}
            disabled={isFull && !isAttending}
            className={cn(
              "w-full py-2 rounded-lg text-xs font-semibold transition-colors",
              isAttending
                ? "bg-kampmax-navy text-white"
                : isFull
                  ? "bg-kampmax-muted text-kampmax-text-secondary cursor-not-allowed"
                  : "bg-kampmax-blue text-white hover:bg-kampmax-blue/90"
            )}
          >
            {isAttending
              ? "Attending ✓"
              : isFull
                ? "Full"
                : "Attend"}
          </button>
        )}
      </div>
    </div>
  );
}
