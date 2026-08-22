import Link from "next/link";
import { Calendar, MapPin, Users, Video } from "lucide-react";
import { CampusEvent } from "@/types";
import { formatDate, cn } from "@/lib/utils";

interface EventCardProps {
  event: CampusEvent;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const start = new Date(event.startDate);
  const isUpcoming = start > new Date();
  const spotsLeft = event.maxAttendees
    ? event.maxAttendees - event.attendees.length
    : null;

  return (
    <Link
      href={`/campus?event=${event.id}`}
      className={cn(
        "flex-shrink-0 w-[260px] bg-white rounded-lg border border-kampmax-border overflow-hidden",
        "hover:border-kampmax-blue/50 hover:shadow-sm transition-all duration-200",
        className
      )}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded",
              isUpcoming
                ? "bg-kampmax-success/10 text-kampmax-success"
                : "bg-kampmax-muted text-kampmax-text-secondary"
            )}
          >
            {isUpcoming ? "Upcoming" : "Past"}
          </span>
          {event.isVirtual && (
            <span className="flex items-center gap-1 text-[10px] text-kampmax-blue">
              <Video className="h-3 w-3" />
              Virtual
            </span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-kampmax-text line-clamp-2 leading-tight">
          {event.title}
        </h3>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-kampmax-text-secondary">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-kampmax-text-secondary">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-kampmax-text-secondary">
            <Users className="h-3 w-3" />
            <span>{event.attendees.length} attending</span>
          </div>
          {spotsLeft !== null && spotsLeft <= 10 && (
            <span className="text-[10px] font-medium text-kampmax-error">
              {spotsLeft} spots left
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
