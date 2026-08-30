"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getProviderBookings, type ProviderBookingFilter } from "@/services/booking";
import { BookingListCard } from "./BookingListCard";
import { BookingEmptyState } from "./BookingEmptyState";

const TABS: { key: ProviderBookingFilter; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
];

export function ServiceProviderBookingsView() {
  const [tab, setTab] = useState<ProviderBookingFilter>("pending");

  const bookings = useMemo(() => getProviderBookings(tab), [tab]);
  const counts = useMemo(
    () =>
      ({
        pending: getProviderBookings("pending").length,
        upcoming: getProviderBookings("upcoming").length,
        completed: getProviderBookings("completed").length,
        cancelled: getProviderBookings("cancelled").length,
        all: getProviderBookings("all").length,
      }) as Record<ProviderBookingFilter, number>,
    [tab]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-kampmax-text">Bookings</h1>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          {counts.pending > 0
            ? `${counts.pending} request${counts.pending !== 1 ? "s" : ""} awaiting your response.`
            : "Appointments requested through your service listings."}
        </p>
      </div>

      <div className="flex gap-1 rounded-lg bg-kampmax-muted p-1" role="tablist" aria-label="Booking filters">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-all",
              tab === t.key
                ? "bg-white text-kampmax-navy shadow-sm"
                : "text-kampmax-text-secondary hover:text-kampmax-text"
            )}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span
                className={cn(
                  "min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold",
                  tab === t.key
                    ? "bg-kampmax-blue text-white"
                    : t.key === "pending"
                      ? "bg-warning-200 text-warning-800"
                      : "bg-kampmax-border text-kampmax-text-secondary"
                )}
              >
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        tab === "pending" ? (
          <BookingEmptyState
            title="No pending requests"
            description="When a customer asks to book one of your services, the request shows up here."
          />
        ) : tab === "upcoming" ? (
          <BookingEmptyState
            title="No upcoming bookings"
            description="Confirmed appointments for you and your customer appear here."
          />
        ) : (
          <BookingEmptyState
            title={`No ${tab} bookings`}
            description="Nothing here yet."
          />
        )
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingListCard
              key={booking.id}
              booking={booking}
              role="provider"
              highlightsPending
            />
          ))}
        </div>
      )}
    </div>
  );
}