// ============================================================
// SERVICE BOOKING & SCHEDULING DOMAIN TYPES  (Module 18)
// ============================================================
//
// Backend-authoritative projections for the booking & scheduling module.
//
//   - Slots, prices, and every status transition are decided by the mock
//     "backend" (src/data/booking.ts). The UI only renders what the backend
//     returns — it NEVER computes availability from weekly hours.
//   - Mutations are idempotent: each create/reschedule carries an
//     `idempotencyKey` so retries after an ambiguous timeout cannot double-book.
//   - All timestamps are absolute ISO-8601 instants paired with an explicit
//     `timeZone` ("Africa/Lagos"). Slot wall-clock labels are derived from the
//     booking timezone, never from the viewer's device clock.
//   - Private phone numbers are only shown to the party who owns the booking
//     (customer on their booking, provider on theirs).

import type {
  ServiceProviderLocationType,
  ServiceProviderPricingModel,
} from "@/types/service-provider";

// ── Booking status (backend life-cycle) ───────────────────────

export type BookingStatus =
  | "pending" // request_approval provider — awaiting provider confirmation
  | "confirmed" // provider accepted, or instant booking confirmed automatically
  | "in_progress" // provider started the appointment
  | "completed" // appointment finished
  | "cancelled" // cancelled within policy (by either party)
  | "declined"; // provider declined a request_approval booking

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  declined: "Declined",
};

export const BOOKING_STATUS_SHORT_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  declined: "Declined",
};

export type BookingStatusTone = "gold" | "green" | "blue" | "neutral" | "red" | "slate";

export const BOOKING_STATUS_TONE: Record<BookingStatus, BookingStatusTone> = {
  pending: "gold",
  confirmed: "green",
  in_progress: "blue",
  completed: "green",
  cancelled: "red",
  declined: "red",
};

/** Statuses that occupy a provider's calendar slot. */
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
];

// ── Timeline ──────────────────────────────────────────────────

export type BookingTimelineEventKind =
  | "created"
  | "accepted"
  | "declined"
  | "started"
  | "rescheduled"
  | "cancelled"
  | "completed";

export interface BookingTimelineEvent {
  id: string;
  kind: BookingTimelineEventKind;
  title: string;
  message?: string;
  createdAt: string; // ISO-8601 (absolute instant)
}

// ── Location ──────────────────────────────────────────────────

export interface BookingLocation {
  /** How the appointment happens (backend-resolved from the service). */
  type: ServiceProviderLocationType;
  /** Display label, e.g. "Provider location · Engineering Block, RUGIPO". */
  label: string;
  /** Customer-supplied address for customer_location services. */
  address?: string;
}

// ── Price ─────────────────────────────────────────────────────

export interface BookingPrice {
  model: ServiceProviderPricingModel;
  /** The amount confirmed by the backend when the booking was created. */
  amount: number;
  amountMax?: number;
  /** Human-readable note (e.g. "Starting from — final cost set after inspection"). */
  note: string;
  /** Optional fee set by the provider when request_approval is accepted. */
  finalFeeLabel?: string;
}

// ── Booking (backend projection) ──────────────────────────────

export interface ServiceBooking {
  id: string; // "bkm_..."
  bookingReference: string; // "KM-XXXXXX"
  customerId: string;
  providerId: string;
  serviceId: string;
  serviceName: string;
  serviceImageUrl?: string;
  status: BookingStatus;
  bookingPreference: "instant" | "request_approval";
  /** Absolute start instant (ISO-8601). */
  startAt: string;
  /** Absolute end instant (ISO-8601). */
  endAt: string;
  timeZone: string;
  durationMinutes: number;
  price: BookingPrice;
  location: BookingLocation;
  /** Customer contact — only exposed to the booking's parties. */
  customer: {
    name: string;
    phone: string;
    email?: string;
    campusId?: string;
  };
  notes?: string;
  cancellationPolicy: {
    freeUntilHours: number;
    message: string;
  };
  cancelledBy?: "customer" | "provider";
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
  timeline: BookingTimelineEvent[];
}

// ── Availability (backend-authoritative slots) ────────────────

export type BookingDayUnavailableReason =
  | "past"
  | "closed"
  | "advance_notice"
  | "too_far"
  | "fully_booked"
  | "none";

export interface BookingSlot {
  /** Wall-clock start in the service timezone ("HH:mm"). */
  startTime: string;
  /** Wall-clock end in the service timezone ("HH:mm"). */
  endTime: string;
  /** Absolute start instant (ISO-8601). */
  startAt: string;
  durationMinutes: number;
  taken: boolean;
  /** Why a slot is unavailable (e.g. "already booked", "too late to book"). */
  reason?: string;
}

export interface DayAvailability {
  /** Date key in the service timezone ("YYYY-MM-DD"). */
  date: string;
  /** Short label: "Today", "Tomorrow", or "Sat 13 Feb". */
  label: string;
  /** Full label: "Saturday, 13 February 2026". */
  fullLabel: string;
  /** 0 = Monday ... 6 = Sunday in the service timezone. */
  weekday: number;
  available: boolean;
  reason: BookingDayUnavailableReason;
  reasonLabel?: string;
  timeZone: string;
  slots: BookingSlot[];
}

export interface BookingAvailabilityResponse {
  serviceId: string;
  providerId: string;
  serviceName: string;
  serviceImageUrl?: string;
  bookingPreference: "instant" | "request_approval";
  bookingPreferenceLabel: string;
  durationMinutes: number;
  locationType: ServiceProviderLocationType;
  locationLabel: string;
  price: BookingPrice;
  minAdvanceHours: number;
  maxAdvanceDays: number;
  timeZone: string;
  days: DayAvailability[];
}

// ── Create booking ────────────────────────────────────────────

export interface CreateBookingInput {
  serviceId: string;
  startAt: string; // ISO-8601 absolute instant
  locationType: ServiceProviderLocationType;
  address?: string;
  notes?: string;
  customerPhone: string;
  idempotencyKey: string;
}

// ── Cancellation / reschedule ─────────────────────────────────

export interface CancelBookingInput {
  id: string;
  reason?: string;
  cancelledBy: "customer" | "provider";
}

export interface RescheduleBookingInput {
  id: string;
  startAt: string; // ISO-8601 absolute instant
  idempotencyKey: string;
}

// ── Provider actions ──────────────────────────────────────────

export interface ProviderBookingDecision {
  id: string;
  /** Final fee set when accepting (overrides starting_from price). */
  finalFee?: number;
  reason?: string;
}

// ── Errors ────────────────────────────────────────────────────

export type BookingErrorCode =
  | "401" // unauthenticated
  | "403" // not the owner / not permitted
  | "404" // missing service or booking
  | "409" // slot no longer available (race) — recoverable
  | "422" // validation / policy
  | "429" // rate limited
  | "500" // internal
  | "timeout"; // ambiguous result — safe to check status

export interface BookingError {
  code: BookingErrorCode;
  message: string;
  field?: string;
  /** True when the caller may retry (e.g. pick a new slot after 409). */
  recoverable?: boolean;
  /** Suggest nearby free slots after a 409. */
  suggestedSlots?: string[];
}

export type BookingResult =
  | { ok: true; booking: ServiceBooking; alreadyExisted?: boolean }
  | { ok: false; error: BookingError };

// ── List filters ──────────────────────────────────────────────

export type BookingListFilter = "upcoming" | "past" | "cancelled" | "all";

// ── Ready states (payment/escrow/review not yet implemented) ──

export type BookingPaymentStage =
  | "not_required"
  | "not_started"
  | "pending"
  | "settled";

export interface BookingReadyState {
  paymentStage: BookingPaymentStage;
  paymentLabel: string;
  requiresProviderApproval: boolean;
  canCancel: boolean;
  canReschedule: boolean;
  canReview: boolean;
  cancelBlockedReason?: string;
}