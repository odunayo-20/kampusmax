"use client";

import { CalendarClock } from "lucide-react";
import { formatBookingDay, formatBookingTime } from "@/services/booking";
import type { ServiceBooking } from "@/types/booking";

/**
 * Booking date/time display ("Sat 14 Feb · 09:30–10:30").
 * Labels are always derived from the booking's authoritative timezone.
 */
export function BookingDateTime({ booking }: { booking: ServiceBooking }) {
  const startMs = new Date(booking.startAt).getTime();
  const endMs = new Date(booking.endAt).getTime();
  return (
    <p className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
      <CalendarClock className="h-4 w-4 text-primary-600" aria-hidden />
      {formatBookingDay(startMs)} · {formatBookingTime(startMs)}–{formatBookingTime(endMs)}
    </p>
  );
}