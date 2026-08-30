"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { PageContainer } from "@/components/layout/PageContainer";
import { getCustomerBookings } from "@/services/booking";
import { BookingListCard } from "./BookingListCard";
import { BookingEmptyState } from "./BookingEmptyState";
import type { BookingListFilter } from "@/types/booking";

const TABS: { key: BookingListFilter; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
];

/** Customer booking dashboard (auth-gated by the (main) layout). */
export function CustomerBookingsView() {
  const { user } = useAuth();
  const [tab, setTab] = useState<BookingListFilter>("upcoming");

  const userId = user?.id ?? "u1";
  const bookings = useMemo(() => getCustomerBookings(tab), [tab, userId]);
  const counts = useMemo(
    () =>
      ({
        upcoming: getCustomerBookings("upcoming").length,
        past: getCustomerBookings("past").length,
        cancelled: getCustomerBookings("cancelled").length,
        all: getCustomerBookings("all").length,
      }) as Record<BookingListFilter, number>,
    [userId]
  );

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-kampmax-text">My Bookings</h1>
            <p className="mt-0.5 text-xs text-kampmax-text-secondary">
              Your service appointments across Kampmax.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" aria-hidden /> Book a service
          </Link>
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
                    tab === t.key ? "bg-kampmax-blue text-white" : "bg-kampmax-border text-kampmax-text-secondary"
                  )}
                >
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {bookings.length === 0 ? (
          tab === "upcoming" ? (
            <BookingEmptyState
              title="No upcoming bookings"
              description="Book a service and your appointments will show up here."
              ctaHref="/services"
              ctaLabel="Browse services"
            />
          ) : (
            <BookingEmptyState
              title={`No ${tab} bookings yet`}
              description="Bookings in this section will appear here."
            />
          )
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingListCard key={booking.id} booking={booking} role="customer" />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}