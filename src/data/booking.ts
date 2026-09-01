// ============================================================
// SERVICE BOOKING BACKEND STORE  (Module 18)
// ============================================================
//
// Owner-scoped mock of the future booking backend:
//   GET    /bookings/availability?serviceId=:id&dateFrom=..&dateTo=..
//   POST   /bookings
//   GET    /me/bookings
//   GET    /me/bookings/:id
//   POST   /me/bookings/:id/cancel
//   POST   /me/bookings/:id/reschedule
//   GET    /service-provider/bookings
//   GET    /service-provider/bookings/:id
//   POST   /service-provider/bookings/:id/accept
//   POST   /service-provider/bookings/:id/decline
//   POST   /service-provider/bookings/:id/start
//   POST   /service-provider/bookings/:id/complete
//
// BACKEND-AUTHORITATIVE CONTRACT (the frontend MUST NOT re-derive any of this):
//   - Slot availability is ONLY generated here from weekly hours + buffer +
//     existing bookings. The UI never computes a slot from provider hours.
//   - Every mutation is validated and executed atomically against the store.
//     Concurrent conflicts surface as 409 (SLOT_UNAVAILABLE) with alternatives.
//   - Mutations are idempotent via `idempotencyKey` (retrying after an
//     ambiguous timeout returns the SAME booking instead of a duplicate).
//   - The booking timezone ("Africa/Lagos") is authoritative for all
//     wall-clock slot labels. The module never trusts a client clock.
//   - Ownership is derived from the token in the service layer; this module
//     only stores backend facts and never exposes private fields to the UI.
//
// NOTE: `quote` services (msvc4/7/17) and zero-duration services are NOT
// bookable online — that flow stays on the existing quote request.

import type {
  BookingAvailabilityResponse,
  BookingDayUnavailableReason,
  BookingError,
  BookingEvidence,
  BookingFulfillment,
  BookingListFilter,
  BookingListQuery,
  BookingLocation,
  BookingPageResult,
  BookingResult,
  BookingReviewInput,
  BookingSlot,
  BookingSort,
  BookingSettlementBreakdown,
  CancelBookingInput,
  DayAvailability,
  ProviderBookingDecision,
  ProviderBookingStatusFilter,
  RescheduleBookingInput,
  ServiceBooking,
  ServiceProblemCategory,
} from "@/types/booking";
import {
  ACTIVE_BOOKING_STATUSES,
} from "@/types/booking";
import {
  COMPLETION_CONFIRMATION_REQUIRED_CATEGORY_IDS,
  COMPLETION_EVIDENCE_ALLOWED_CATEGORY_IDS,
  ESCROW_STATE_LABELS,
  PAYMENT_STATE_LABELS,
  PLATFORM_FEE_RATE,
  PROBLEM_ASSIGNED_TO,
  REVIEW_WINDOW_DAYS,
  SETTLEMENT_DISCLAIMER,
} from "@/config/service-order";
import type {
  MarketplaceProvider,
  MarketplaceService,
} from "@/types/service-marketplace";
import {
  marketplaceServiceProviders,
  marketplaceServices,
} from "@/data/service-marketplace";
import type {
  ServiceProviderLocationType,
} from "@/types/service-provider";

// ── Authorship policy (demo values the "backend" enforces) ────

const BOOKING_TIME_ZONE = "Africa/Lagos";
const LAGOS_OFFSET_MS = 60 * 60 * 1000; // UTC+1, no DST
const DEFAULT_APPOINTMENT_BUFFER_MINUTES = 15;
const DEFAULT_MAX_ADVANCE_DAYS = 30;
const FREE_CANCELLATION_HOURS = 2;

export const cancellationPolicy = {
  freeUntilHours: FREE_CANCELLATION_HOURS,
  message: `Free cancellation up to ${FREE_CANCELLATION_HOURS} hours before your appointment. Later cancellations are managed by the provider.`,
};

// ── Tiny time helpers (authoritative: booking timezone) ──────

function dayKeyOf(ms: number): string {
  const d = new Date(ms + LAGOS_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function dayStartMsOf(dayKey: string): number {
  const [y, m, d] = dayKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d) - LAGOS_OFFSET_MS;
}

function addDaysKey(dayKey: string, days: number): string {
  return dayKeyOf(dayStartMsOf(dayKey) + days * 86_400_000);
}

/** Wall-clock weekday 0=Monday..6=Sunday for the booking timezone. */
function weekdayOf(dayKey: string): number {
  const d = new Date(dayStartMsOf(dayKey) + LAGOS_OFFSET_MS);
  return (d.getUTCDay() + 6) % 7;
}

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

function minutesToHHmm(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function toHHmmLocal(isoMs: number): string {
  const d = new Date(isoMs + LAGOS_OFFSET_MS);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

const dayShortFormatter = new Intl.DateTimeFormat("en-NG", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: BOOKING_TIME_ZONE,
});
const dayFullFormatter = new Intl.DateTimeFormat("en-NG", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: BOOKING_TIME_ZONE,
});

function dayLabels(dayKey: string): { label: string; fullLabel: string } {
  const base = new Date(dayStartMsOf(dayKey));
  return {
    label: dayShortFormatter.format(base),
    fullLabel: dayFullFormatter.format(base),
  };
}

function locationLabelFor(
  service: MarketplaceService,
  type: ServiceProviderLocationType,
  address?: string
): string {
  if (type === "online") return "Online session (remote)";
  if (type === "customer_location") return address ? `Your location · ${address}` : "Your location (address added below)";
  if (type === "provider_location") return "Provider location";
  if (type === "flexible") return "Flexible — agree a spot with the provider";
  return address ? `Your location · ${address}` : "Your location";
}

/** Backend-resolved booking location — the frontend passes the chosen type, never a label. */
export function resolveBookingLocation(
  service: MarketplaceService,
  type: ServiceProviderLocationType,
  address?: string
): BookingLocation {
  return {
    type,
    label: locationLabelFor(service, type, address),
    address: type === "customer_location" || type === "flexible" ? address : undefined,
  };
}

function servicePrice(service: MarketplaceService): ServiceBooking["price"] {
  switch (service.pricingModel) {
    case "fixed":
      return {
        model: "fixed",
        amount: service.price,
        note: "Fixed price confirmed at booking.",
      };
    case "range":
      return {
        model: "range",
        amount: service.price,
        amountMax: service.priceMax,
        note: `Kampmax range ${service.price.toLocaleString("en-NG")}–${(service.priceMax ?? service.price).toLocaleString("en-NG")} naira — final agreed with the provider.`,
      };
    case "starting_from":
      return {
        model: "starting_from",
        amount: service.price,
        note: `Starting from ${service.price.toLocaleString("en-NG")} naira — the provider confirms the exact fee at your appointment.`,
      };
    default:
      return { model: "quote", amount: 0, note: "Not bookable online." };
  }
}

function isBookable(service: MarketplaceService): boolean {
  return (
    service.isActive &&
    service.pricingModel !== "quote" &&
    service.durationMinutes > 0
  );
}

const activeProviders = marketplaceServiceProviders;

function providerById(id: string): MarketplaceProvider | undefined {
  return activeProviders.find((p) => p.id === id);
}

function serviceById(id: string): MarketplaceService | undefined {
  return marketplaceServices.find((s) => s.id === id);
}

// ── Store ─────────────────────────────────────────────────────

let bookingSeq = 100;
const idempotencyStore = new Map<string, string>(); // key -> bookingId

interface BookingStore {
  bookings: ServiceBooking[];
}

const store: BookingStore = { bookings: [] };

function newBookingId(): string {
  bookingSeq += 1;
  return `bkm${bookingSeq}`;
}

function newReference(): string {
  // Deterministic-enough short code for demo references (KM-XXXXXX).
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `KM-${code}`;
}

function cloneBooking<T extends ServiceBooking>(b: T): T {
  return structuredClone(b);
}

// ── Seed bookings (relative to "now", reusable across sessions) ──

interface SeededSlot {
  start: string;
  end: string;
}

function slotAt(dayOffset: number, hhmm: string, durationMinutes: number, nowMs: number): SeededSlot {
  const dayKey = addDaysKey(dayKeyOf(nowMs), dayOffset);
  const startMs = dayStartMsOf(dayKey) + hhmmToMinutes(hhmm) * 60_000;
  return {
    start: new Date(startMs).toISOString(),
    end: new Date(startMs + durationMinutes * 60_000).toISOString(),
  };
}

function baseCustomer(name: string, phone: string, email: string, customerId: string) {
  return { customerId, name, phone, email, campusId: "rugipo" };
}

// ── Fulfilment model (backend-owned post-completion lifecycle) ──

function newEvidenceId(): string {
  return `ev${Math.floor(Math.random() * 1_000_000)}`;
}

function mkFulfillment(service: MarketplaceService): BookingFulfillment {
  return {
    requiresCompletionConfirmation: (
      COMPLETION_CONFIRMATION_REQUIRED_CATEGORY_IDS as readonly string[]
    ).includes(service.categoryId),
    allowCompletionEvidence: (
      COMPLETION_EVIDENCE_ALLOWED_CATEGORY_IDS as readonly string[]
    ).includes(service.categoryId),
    confirmationStatus: "not_required",
    payment: { state: "unpaid", label: PAYMENT_STATE_LABELS.unpaid },
    escrow: { state: "not_available", label: ESCROW_STATE_LABELS.not_available },
  };
}

function settlementPreviewFor(b: ServiceBooking, nowMs: number): BookingSettlementBreakdown {
  const serviceAmount = b.price.amount;
  const platformFee = Math.round(serviceAmount * PLATFORM_FEE_RATE * 100) / 100;
  const tax = 0;
  return {
    currency: "NGN",
    serviceAmount,
    platformFee,
    platformFeeRate: PLATFORM_FEE_RATE,
    providerEarnings: serviceAmount - platformFee - tax,
    tax,
    feeLabel: b.price.finalFeeLabel ?? "Standard platform fee",
    computedAt: new Date(nowMs).toISOString(),
    disclaimer: SETTLEMENT_DISCLAIMER,
  };
}

function reviewEligibleUntilAfter(completedAtIso: string): string {
  const ms = new Date(completedAtIso).getTime();
  return new Date(ms + REVIEW_WINDOW_DAYS * 24 * 3_600_000).toISOString();
}

/** Reconciles payment/escrow readiness + settlement from the current
 * status/confirmation state. Called by every fulfilment mutation. */
function syncFulfillmentState(b: ServiceBooking, nowMs: number): void {
  const f = b.fulfillment;
  let paymentLabel = "No charge until the service is completed.";
  if (b.status === "cancelled" || b.status === "declined") {
    paymentLabel = "No charge was made for this booking.";
  } else if (b.status === "completed") {
    if (f.confirmationStatus === "awaiting") {
      paymentLabel = "Payment is requested once you confirm the service was completed.";
    } else if (f.confirmationStatus === "confirmed") {
      f.settlement = settlementPreviewFor(b, nowMs);
      f.reviewEligibleUntil = f.reviewEligibleUntil ?? reviewEligibleUntilAfter(f.completedAt ?? b.updatedAt);
      paymentLabel = `Payment received and held in escrow — readiness preview, no charge was made.`;
      f.payment = { state: "paid", label: paymentLabel };
      f.escrow = { state: "held", label: `Held in escrow — readiness preview (NGN ${b.price.amount.toLocaleString()}).` };
      return;
    } else if (f.confirmationStatus === "problem_reported") {
      paymentLabel = "On hold until the reported issue is reviewed.";
      f.escrow = { state: "disputed", label: `Disputed — awaiting review by ${PROBLEM_ASSIGNED_TO}.` };
      f.payment = { state: "unpaid", label: paymentLabel };
      return;
    }
  }
  f.payment = { state: "unpaid", label: paymentLabel };
  f.escrow = { state: "not_available", label: ESCROW_STATE_LABELS.not_available };
}

function buildSeedBookings(nowMs: number): ServiceBooking[] {
  const cat = (serviceId: string) => serviceById(serviceId);
  const providerOf = (serviceId: string) => {
    const s = cat(serviceId);
    return s ? providerById(s.providerId) : undefined;
  };

  const seed = (
    serviceId: string,
    customer: ReturnType<typeof baseCustomer>,
    status: ServiceBooking["status"],
    dayOffset: number,
    hhmm: string,
    locationType: ServiceProviderLocationType,
    opts: Omit<Partial<ServiceBooking>, "fulfillment"> & {
      cancelledBy?: ServiceBooking["cancelledBy"];
      fulfillment?: Partial<BookingFulfillment>;
    }
  ): ServiceBooking => {
    const service = cat(serviceId);
    const provider = providerOf(serviceId);
    const slot = slotAt(dayOffset, hhmm, service?.durationMinutes ?? 60, nowMs);
    const bookableProvider = provider ?? providerById("sp1")!;
    const bookableService = service ?? serviceById("msvc1")!;
    const preference =
      bookableProvider.availability.bookingPreference === "instant" ? ("instant" as const) : ("request_approval" as const);
    const statusBase: ServiceBooking["status"] =
      preference === "instant" && status === "pending" ? "confirmed" : status;

    const timeline: ServiceBooking["timeline"] = [
      {
        id: `${serviceId}-tl-created`,
        kind: "created",
        title: preference === "instant" ? "Booking placed" : "Booking request sent",
        message: `${bookableService.name} requested${preference === "instant" ? " and confirmed instantly" : ""}.`,
        createdAt: new Date(nowMs - 60_000).toISOString(),
      },
    ];
    if (statusBase === "confirmed" && preference === "instant") {
      timeline.push({
        id: `${serviceId}-tl-accepted`,
        kind: "accepted",
        title: "Confirmed instantly",
        message: "The provider turns on instant booking for this service.",
        createdAt: new Date(nowMs - 30_000).toISOString(),
      });
    }
    if (statusBase === "in_progress" || statusBase === "completed") {
      timeline.push({
        id: `${serviceId}-tl-started`,
        kind: "started",
        title: "Appointment started",
        message: "The provider started this appointment.",
        createdAt: new Date(nowMs - 25 * 60_000).toISOString(),
      });
    }
    if (statusBase === "completed") {
      timeline.push({
        id: `${serviceId}-tl-completed`,
        kind: "completed",
        title: "Booking completed",
        message: "The provider completed this appointment.",
        createdAt: new Date(nowMs - 20 * 60_000).toISOString(),
      });
    }

    const fulfillment: BookingFulfillment = {
      ...mkFulfillment(bookableService),
      ...opts.fulfillment,
    };
    if (statusBase === "in_progress" || statusBase === "completed") {
      fulfillment.startedAt = new Date(Math.min(new Date(slot.start).getTime(), nowMs - 5 * 60_000)).toISOString();
    }
    if (statusBase === "completed") {
      const startMs = new Date(slot.start).getTime();
      fulfillment.completedAt = new Date(Math.min(nowMs - 15 * 60_000, startMs + bookableService.durationMinutes * 60_000)).toISOString();
    }

    const booking: ServiceBooking = {
      id: `bkmSeed_${serviceId}_${opts.cancelledBy ?? statusBase}`,
      bookingReference: newReference(),
      customerId: customer.customerId,
      providerId: bookableProvider.id,
      serviceId: bookableService.id,
      serviceName: bookableService.name,
      serviceImageUrl: bookableService.imageUrl,
      status: statusBase,
      bookingPreference: preference,
      startAt: slot.start,
      endAt: slot.end,
      timeZone: BOOKING_TIME_ZONE,
      durationMinutes: bookableService.durationMinutes,
      price: servicePrice(bookableService),
      location: {
        type: locationType,
        label: locationLabelFor(bookableService, locationType),
      },
      customer,
      notes: opts.notes,
      cancellationPolicy,
      cancelledBy: opts.cancelledBy,
      declineReason: opts.declineReason,
      createdAt: new Date(nowMs - 60_000).toISOString(),
      updatedAt: new Date(nowMs - 30_000).toISOString(),
      timeline,
      fulfillment,
    };
    syncFulfillmentState(booking, nowMs);
    return booking;
  };

  const nowMinusMinutes = (minutes: number) => toHHmmLocal(nowMs - minutes * 60_000);

  // Provider (sp1) calendar, incoming from other students.
  const providerBookings = [
    seed("msvc1", baseCustomer("Chioma Nwosu", "+234 813 456 7890", "chioma@rugipo.edu.ng", "u2"), "pending", 1, "10:00", "provider_location", {}),
    seed("msvc2", baseCustomer("Ibrahim Musa", "+234 814 567 8901", "ibrahim@rugipo.edu.ng", "u3"), "confirmed", 2, "11:00", "provider_location", {}),
    seed("msvc3", baseCustomer("Folashade Adeyemi", "+234 815 678 9012", "folashade@rugipo.edu.ng", "u4"), "confirmed", 3, "09:30", "online", {}),
    seed("msvc1", baseCustomer("Emeka Obi", "+234 816 789 0123", "emeka@rugipo.edu.ng", "u5"), "completed", -6, "14:00", "provider_location", { fulfillment: { confirmationStatus: "confirmed", customerConfirmedAt: new Date(nowMs - 5 * 24 * 3_600_000).toISOString() } }),
    seed("msvc2", baseCustomer("Chioma Nwosu", "+234 813 456 7890", "chioma@rugipo.edu.ng", "u2"), "cancelled", 1, "14:00", "provider_location", { cancelledBy: "customer" }),
    seed("msvc2", baseCustomer("Ibrahim Musa", "+234 814 567 8901", "ibrahim@rugipo.edu.ng", "u3"), "in_progress", 0, nowMinusMinutes(40), "provider_location", {}),
  ];

  // Customer (u1) history, on other providers.
  const customerBookings = [
    seed("msvc6", baseCustomer("Adebayo Oluwaseun", "+234 812 345 6789", "adebayo@rugipo.edu.ng", "u1"), "pending", 2, "13:00", "customer_location", {}),
    seed("msvc6", baseCustomer("Adebayo Oluwaseun", "+234 812 345 6789", "adebayo@rugipo.edu.ng", "u1"), "in_progress", 0, nowMinusMinutes(30), "customer_location", {}),
    seed("msvc6", baseCustomer("Adebayo Oluwaseun", "+234 812 345 6789", "adebayo@rugipo.edu.ng", "u1"), "completed", -1, "12:00", "customer_location", { fulfillment: { confirmationStatus: "awaiting" } }),
    seed("msvc16", baseCustomer("Adebayo Oluwaseun", "+234 812 345 6789", "adebayo@rugipo.edu.ng", "u1"), "completed", -5, "07:00", "provider_location", { fulfillment: { confirmationStatus: "confirmed", customerConfirmedAt: new Date(nowMs - 5 * 24 * 3_600_000).toISOString() } }),
    seed("msvc12", baseCustomer("Adebayo Oluwaseun", "+234 812 345 6789", "adebayo@rugipo.edu.ng", "u1"), "cancelled", -3, "12:00", "provider_location", { cancelledBy: "customer" }),
  ];

  return [...providerBookings, ...customerBookings];
}

function primeStore(): void {
  store.bookings = buildSeedBookings(Date.now());
}

primeStore();

// ── Availability engine (backend-authoritative) ───────────────

interface SlotWithMeta {
  startMs: number;
  endMs: number;
  durationMinutes: number;
}

/** Does [start,end) of a NEW booking overlap an existing active booking? */
function conflictsWithActiveBooking(
  providerId: string,
  startMs: number,
  endMs: number,
  excludeBookingId?: string
): boolean {
  return store.bookings.some((b) => {
    if (b.id === excludeBookingId) return false;
    if (b.providerId !== providerId) return false;
    if (!ACTIVE_BOOKING_STATUSES.includes(b.status)) return false;
    const bStart = new Date(b.startAt).getTime();
    const bEnd = new Date(b.endAt).getTime();
    return startMs < bEnd && endMs > bStart;
  });
}

function buildSlots(
  service: MarketplaceService,
  provider: MarketplaceProvider,
  dayKey: string,
  nowMs: number
): { slots: BookingSlot[]; blockedReason: BookingDayUnavailableReason | null } {
  const weekday = weekdayOf(dayKey);
  const day = provider.availability.days.find((d) => d.dayIndex === weekday);
  if (!day || !day.isAvailable || !day.openTime || !day.closeTime) {
    return { slots: [], blockedReason: "closed" };
  }

  const todayKey = dayKeyOf(nowMs);
  const maxKey = addDaysKey(todayKey, DEFAULT_MAX_ADVANCE_DAYS);
  if (dayKey < todayKey) return { slots: [], blockedReason: "past" };
  if (dayKey > maxKey) return { slots: [], blockedReason: "too_far" };

  const bufferMinutes = DEFAULT_APPOINTMENT_BUFFER_MINUTES;
  const stepMinutes = service.durationMinutes + bufferMinutes;
  const dayStartMs = dayStartMsOf(dayKey);
  const openMs = dayStartMs + hhmmToMinutes(day.openTime) * 60_000;
  const closeMs = dayStartMs + hhmmToMinutes(day.closeTime) * 60_000;
  const minAdvanceMs = provider.availability.minAdvanceNoticeHours * 3_600_000;

  const generated: SlotWithMeta[] = [];
  let cursor = openMs;
  while (cursor + service.durationMinutes * 60_000 <= closeMs) {
    generated.push({
      startMs: cursor,
      endMs: cursor + service.durationMinutes * 60_000,
      durationMinutes: service.durationMinutes,
    });
    cursor += stepMinutes * 60_000;
  }

  let advanceBlockedAll = true;
  const slots: BookingSlot[] = generated.map((g) => {
    if (g.startMs < nowMs) {
      return { ...toSlot(g), taken: true, reason: "This time has passed" };
    }
    if (g.startMs < nowMs + minAdvanceMs) {
      return { ...toSlot(g), taken: true, reason: `Too late to book — the provider needs ${provider.availability.minAdvanceNoticeHours}h notice` };
    }
    advanceBlockedAll = false;
    if (conflictsWithActiveBooking(provider.id, g.startMs, g.endMs)) {
      return { ...toSlot(g), taken: true, reason: "Already booked" };
    }
    return { ...toSlot(g), taken: false };
  });

  const free = slots.filter((s) => !s.taken).length;
  if (free > 0) return { slots, blockedReason: null };
  if (generated.length > 0 && advanceBlockedAll && dayKey === todayKey) {
    return { slots, blockedReason: "advance_notice" };
  }
  return { slots, blockedReason: "fully_booked" };
}

function toSlot(g: SlotWithMeta): BookingSlot {
  return {
    startTime: toHHmmLocal(g.startMs),
    endTime: toHHmmLocal(g.endMs),
    startAt: new Date(g.startMs).toISOString(),
    durationMinutes: g.durationMinutes,
    taken: false,
  };
}

function reasonLabel(reason: BookingDayUnavailableReason): string | undefined {
  switch (reason) {
    case "past":
      return "This date has passed";
    case "closed":
      return "The provider is closed on this day";
    case "advance_notice":
      return "Not enough notice — try a later time";
    case "too_far":
      return "Beyond the provider's booking window";
    case "fully_booked":
      return "All times are booked";
    default:
      return undefined;
  }
}

export function computeAvailabilityResponse(
  serviceId: string,
  nowMs = Date.now()
): BookingAvailabilityResponse | null {
  const service = serviceById(serviceId);
  if (!service || !isBookable(service)) return null;
  const provider = providerById(service.providerId);
  if (!provider) return null;

  const todayKey = dayKeyOf(nowMs);
  const maxAdvance = DEFAULT_MAX_ADVANCE_DAYS;
  const days: DayAvailability[] = [];

  for (let i = 0; i <= maxAdvance; i += 1) {
    const key = addDaysKey(todayKey, i);
    const { slots, blockedReason } = buildSlots(service, provider, key, nowMs);
    const { label, fullLabel } = dayLabels(key);
    const available = blockedReason === null && slots.some((s) => !s.taken);
    days.push({
      date: key,
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : label,
      fullLabel,
      weekday: weekdayOf(key),
      available,
      reason: blockedReason ?? "none",
      reasonLabel: reasonLabel(blockedReason ?? "none"),
      timeZone: BOOKING_TIME_ZONE,
      slots,
    });
  }

  const chosenLocations: ServiceProviderLocationType[] = service.locationType === "both"
    ? ["provider_location", "customer_location", "online"]
    : [service.locationType];

  return {
    serviceId: service.id,
    providerId: provider.id,
    serviceName: service.name,
    serviceImageUrl: service.imageUrl,
    bookingPreference: provider.availability.bookingPreference,
    bookingPreferenceLabel:
      provider.availability.bookingPreference === "instant"
        ? "Instant booking — your slot locks in as soon as you confirm."
        : "This provider confirms requests before the slot is locked.",
    durationMinutes: service.durationMinutes,
    locationType: service.locationType,
    locationLabel: locationLabelFor(service, chosenLocations[0]),
    price: servicePrice(service),
    minAdvanceHours: provider.availability.minAdvanceNoticeHours,
    maxAdvanceDays: maxAdvance,
    timeZone: BOOKING_TIME_ZONE,
    days,
  };
}

/** Suggest the next free slots after a 409 race — used for recovery UI. */
export function suggestAlternativeSlots(serviceId: string, limit = 3, nowMs = Date.now()): string[] {
  const res = computeAvailabilityResponse(serviceId, nowMs);
  if (!res) return [];
  const hits: string[] = [];
  for (const day of res.days) {
    for (const slot of day.slots) {
      if (!slot.taken) {
        const { label } = dayLabels(day.date);
        hits.push(`${label} · ${slot.startTime}–${slot.endTime}`);
        if (hits.length >= limit) return hits;
      }
    }
  }
  return hits;
}

// ── Backend mutations (atomic, validated) ─────────────────────

export interface BackendCreateParams {
  serviceId: string;
  providerId: string;
  startAt: string; // ISO-8601
  durationMinutes: number;
  price: ServiceBooking["price"];
  location: ServiceBooking["location"];
  bookingPreference: "instant" | "request_approval";
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  campusId?: string;
  notes?: string;
  idempotencyKey: string;
}

function error(code: BookingError["code"], message: string, extra?: Partial<BookingError>): BookingError {
  return { code, message, ...extra };
}

function validateWindow(
  service: MarketplaceService,
  provider: MarketplaceProvider,
  startMs: number,
  endMs: number,
  nowMs: number
): BookingError | null {
  const todayKey = dayKeyOf(nowMs);
  const startKey = dayKeyOf(startMs);
  const minAdvanceMs = provider.availability.minAdvanceNoticeHours * 3_600_000;
  const maxAdvance = DEFAULT_MAX_ADVANCE_DAYS;

  if (startMs < nowMs) return error("422", "That time has already passed.", { field: "startAt" });
  if (startMs < nowMs + minAdvanceMs) {
    return error(
      "422",
      `The provider needs at least ${provider.availability.minAdvanceNoticeHours}h notice. Pick a later time.`,
      { field: "startAt" }
    );
  }
  if (startKey > addDaysKey(todayKey, maxAdvance)) {
    return error("422", "That date is beyond the provider's booking window.", { field: "startAt" });
  }

  const weekday = weekdayOf(startKey);
  const day = provider.availability.days.find((d) => d.dayIndex === weekday);
  if (!day || !day.isAvailable) {
    return error("422", "The provider is closed on that day.", { field: "startAt" });
  }
  const dayStartMs = dayStartMsOf(startKey);
  const openMs = dayStartMs + hhmmToMinutes(day.openTime ?? "00:00") * 60_000;
  const closeMs = dayStartMs + hhmmToMinutes(day.closeTime ?? "00:00") * 60_000;
  if (startMs < openMs || endMs > closeMs) {
    return error("422", "The selected time is outside the provider's working hours.", { field: "startAt" });
  }
  return null;
}

export function createBookingOnBackend(
  params: BackendCreateParams,
  nowMs = Date.now()
): BookingResult {
  const service = serviceById(params.serviceId);
  if (!service || !isBookable(service)) {
    return { ok: false, error: error("404", "This service is not available for booking.") };
  }
  const provider = providerById(params.providerId);
  if (!provider) {
    return { ok: false, error: error("404", "This provider is not available.") };
  }

  const startMs = new Date(params.startAt).getTime();
  const endMs = startMs + params.durationMinutes * 60_000;

  // Idempotency: a retried request returns the SAME booking, never a duplicate.
  const existingId = idempotencyStore.get(params.idempotencyKey);
  if (existingId) {
    const existing = store.bookings.find((b) => b.id === existingId);
    if (existing) {
      return { ok: true, booking: cloneBooking(existing), alreadyExisted: true };
    }
    idempotencyStore.delete(params.idempotencyKey);
  }

  const windowErr = validateWindow(service, provider, startMs, endMs, nowMs);
  if (windowErr) return { ok: false, error: windowErr };

  if (conflictsWithActiveBooking(provider.id, startMs, endMs)) {
    return {
      ok: false,
      error: error(
        "409",
        "That time was just booked by someone else. Pick a new time below.",
        { recoverable: true, field: "startAt", suggestedSlots: suggestAlternativeSlots(service.id, 3, nowMs) }
      ),
    };
  }

  const instant = params.bookingPreference === "instant";
  const status: ServiceBooking["status"] = instant ? "confirmed" : "pending";
  const createdAt = new Date(nowMs).toISOString();

  const booking: ServiceBooking = {
    id: newBookingId(),
    bookingReference: newReference(),
    customerId: params.customerId,
    providerId: provider.id,
    serviceId: service.id,
    serviceName: service.name,
    serviceImageUrl: service.imageUrl,
    status,
    bookingPreference: params.bookingPreference,
    startAt: new Date(startMs).toISOString(),
    endAt: new Date(endMs).toISOString(),
    timeZone: BOOKING_TIME_ZONE,
    durationMinutes: params.durationMinutes,
    price: params.price,
    location: params.location,
    customer: {
      name: params.customerName,
      phone: params.customerPhone,
      email: params.customerEmail,
      campusId: params.campusId,
    },
    notes: params.notes,
    cancellationPolicy,
    createdAt,
    updatedAt: createdAt,
    timeline: [
      {
        id: `${newBookingId()}-tl-created`,
        kind: "created",
        title: instant ? "Booking placed" : "Booking request sent",
        message: instant
          ? "Your slot is locked in until you cancel or reschedule."
          : "The provider will confirm your request shortly.",
        createdAt,
      },
    ],
    fulfillment: mkFulfillment(service),
  };
  if (instant) {
    booking.timeline.push({
      id: `${booking.id}-tl-accepted`,
      kind: "accepted",
      title: "Confirmed instantly",
      message: "The provider uses instant booking for this service.",
      createdAt,
    });
  }

  store.bookings.push(booking);
  idempotencyStore.set(params.idempotencyKey, booking.id);

  return { ok: true, booking: cloneBooking(booking) };
}

function findBookingForOwner(
  id: string,
  ownerKey: "customerId" | "providerId",
  ownerValue: string | null
): { booking?: ServiceBooking; err?: BookingError } {
  const booking = store.bookings.find((b) => b.id === id);
  if (!booking) return { err: error("404", "Booking not found.") };
  if (ownerValue && booking[ownerKey] !== ownerValue) {
    return { err: error("403", "You don't have access to this booking.") };
  }
  return { booking };
}

export function cancelBookingOnBackend(
  input: CancelBookingInput,
  owner: { customerId?: string; providerId?: string },
  nowMs = Date.now()
): BookingResult {
  const found = findBookingForOwner(input.id, input.cancelledBy === "provider" ? "providerId" : "customerId", input.cancelledBy === "provider" ? owner.providerId ?? null : owner.customerId ?? null);
  if (!found.booking || found.err) return { ok: false, error: found.err! };

  const booking = found.booking;
  if (booking.status === "cancelled" || booking.status === "declined" || booking.status === "completed") {
    return { ok: false, error: error("422", `A ${booking.status} booking can't be cancelled.`) };
  }

  if (input.cancelledBy === "customer") {
    const freeUntilMs = new Date(booking.startAt).getTime() - FREE_CANCELLATION_HOURS * 3_600_000;
    if (freeUntilMs <= nowMs) {
      return {
        ok: false,
        error: error(
          "422",
          `Free cancellation ended ${FREE_CANCELLATION_HOURS}h before your appointment. Contact the provider to make other arrangements.`,
          { field: "cancelledBy" }
        ),
      };
    }
  }

  booking.status = "cancelled";
  booking.cancelledBy = input.cancelledBy;
  booking.updatedAt = new Date(nowMs).toISOString();
  booking.timeline.push({
    id: `${booking.id}-tl-cancel-${nowMs}`,
    kind: "cancelled",
    title: "Booking cancelled",
    message: input.reason || (input.cancelledBy === "customer" ? "Cancelled by you." : "Cancelled by the provider."),
    createdAt: booking.updatedAt,
  });
  syncFulfillmentState(booking, nowMs);

  return { ok: true, booking: cloneBooking(booking) };
}

export function rescheduleBookingOnBackend(
  input: RescheduleBookingInput,
  owner: { customerId: string; providerId?: string },
  nowMs = Date.now()
): BookingResult {
  const found = findBookingForOwner(input.id, "customerId", owner.customerId);
  if (!found.booking || found.err) return { ok: false, error: found.err! };

  const booking = found.booking;
  if (booking.status !== "pending" && booking.status !== "confirmed") {
    return { ok: false, error: error("422", "Only pending or confirmed bookings can be rescheduled.") };
  }

  const existingId = idempotencyStore.get(input.idempotencyKey);
  if (existingId) {
    const existing = store.bookings.find((b) => b.id === existingId);
    if (existing) return { ok: true, booking: cloneBooking(existing), alreadyExisted: true };
    idempotencyStore.delete(input.idempotencyKey);
  }

  const service = serviceById(booking.serviceId);
  const provider = providerById(booking.providerId);
  if (!service || !provider) return { ok: false, error: error("404", "This service is no longer available.") };

  const startMs = new Date(input.startAt).getTime();
  const endMs = startMs + booking.durationMinutes * 60_000;

  const windowErr = validateWindow(service, provider, startMs, endMs, nowMs);
  if (windowErr) return { ok: false, error: windowErr };

  if (conflictsWithActiveBooking(provider.id, startMs, endMs, booking.id)) {
    return {
      ok: false,
      error: error(
        "409",
        "That new time was just taken. Pick another.",
        { recoverable: true, field: "startAt", suggestedSlots: suggestAlternativeSlots(service.id, 3, nowMs) }
      ),
    };
  }

  const was = toHHmmLocal(new Date(booking.startAt).getTime());
  booking.fulfillment.reschedule = {
    originalStartAt: booking.startAt,
    originalEndAt: booking.endAt,
    rescheduledAt: new Date(nowMs).toISOString(),
  };
  booking.startAt = new Date(startMs).toISOString();
  booking.endAt = new Date(endMs).toISOString();
  booking.updatedAt = new Date(nowMs).toISOString();
  const toLabel = `${dayLabels(dayKeyOf(startMs)).label} · ${toHHmmLocal(startMs)}–${toHHmmLocal(endMs)}`;
  booking.timeline.push({
    id: `${booking.id}-tl-resched-${nowMs}`,
    kind: "rescheduled",
    title: "Booking rescheduled",
    message: `Moved from ${was} to ${toLabel}.`,
    createdAt: booking.updatedAt,
  });
  idempotencyStore.set(input.idempotencyKey, booking.id);

  return { ok: true, booking: cloneBooking(booking) };
}

// ── Provider decisions (ownership-scoped to the provider's dashboard) ──

function providerBookingMutation(
  id: string,
  owner: { providerId: string },
  mutate: (b: ServiceBooking, nowMs: number) => { status: "ok" } | { status: "err"; err: BookingError },
  nowMs = Date.now()
): BookingResult {
  const found = findBookingForOwner(id, "providerId", owner.providerId);
  if (!found.booking || found.err) return { ok: false, error: found.err! };
  const result = mutate(found.booking, nowMs);
  if (result.status === "err") return { ok: false, error: result.err };
  found.booking.updatedAt = new Date(nowMs).toISOString();
  return { ok: true, booking: cloneBooking(found.booking) };
}

export function acceptBookingOnBackend(
  input: ProviderBookingDecision,
  owner: { providerId: string },
  nowMs = Date.now()
): BookingResult {
  return providerBookingMutation(input.id, owner, (b) => {
    if (b.status === "confirmed") return { status: "ok" };
    if (b.status !== "pending") {
      return { status: "err", err: error("422", `A ${b.status} booking can't be accepted.`) };
    }
    b.status = "confirmed";
    if (typeof input.finalFee === "number" && input.finalFee > 0 && b.price.model !== "fixed") {
      b.price.amount = input.finalFee;
      b.price.amountMax = undefined;
      b.price.note = "Fee confirmed by the provider.";
      b.price.finalFeeLabel = "Provider-confirmed fee";
    }
    b.timeline.push({
      id: `${b.id}-tl-accept-${nowMs}`,
      kind: "accepted",
      title: "Booking confirmed",
      message: "The provider confirmed your request.",
      createdAt: new Date(nowMs).toISOString(),
    });
    return { status: "ok" };
  }, nowMs);
}

export function declineBookingOnBackend(
  input: ProviderBookingDecision,
  owner: { providerId: string },
  nowMs = Date.now()
): BookingResult {
  return providerBookingMutation(input.id, owner, (b) => {
    if (b.status !== "pending") {
      return { status: "err", err: error("422", `A ${b.status} booking can't be declined.`) };
    }
    b.status = "declined";
    b.declineReason = input.reason;
    b.timeline.push({
      id: `${b.id}-tl-decline-${nowMs}`,
      kind: "declined",
      title: "Booking declined",
      message: input.reason || "The provider couldn't take this request.",
      createdAt: new Date(nowMs).toISOString(),
    });
    return { status: "ok" };
  }, nowMs);
}

export function startBookingOnBackend(
  id: string,
  owner: { providerId: string },
  nowMs = Date.now()
): BookingResult {
  return providerBookingMutation(id, owner, (b) => {
    if (b.status !== "confirmed") {
      return { status: "err", err: error("422", `Only confirmed bookings can be started.`) };
    }
    b.status = "in_progress";
    b.fulfillment.startedAt = new Date(nowMs).toISOString();
    b.timeline.push({
      id: `${b.id}-tl-start-${nowMs}`,
      kind: "started",
      title: "Appointment started",
      message: "The provider started this appointment.",
      createdAt: new Date(nowMs).toISOString(),
    });
    return { status: "ok" };
  }, nowMs);
}

export interface CompleteBookingOptions {
  /** Provider-attached proof (allowed only for evidenced service categories). */
  evidence?: BookingEvidence[];
}

export function completeBookingOnBackend(
  id: string,
  owner: { providerId: string },
  opts: CompleteBookingOptions = {},
  nowMs = Date.now()
): BookingResult {
  return providerBookingMutation(id, owner, (b) => {
    if (b.status === "completed") return { status: "ok" };
    if (b.fulfillment.confirmationStatus === "problem_reported") {
      return { status: "err", err: error("422", `A booking with a reported issue can't be re-completed.`) };
    }
    if (b.status !== "confirmed" && b.status !== "in_progress") {
      return { status: "err", err: error("422", `A ${b.status} booking can't be completed.`) };
    }
    if (opts.evidence && opts.evidence.length > 0) {
      if (!b.fulfillment.allowCompletionEvidence) {
        return { status: "err", err: error("422", "This service doesn't accept completion evidence.") };
      }
      b.fulfillment.completionEvidence = opts.evidence;
    }
    b.status = "completed";
    const completedAt = new Date(nowMs).toISOString();
    b.fulfillment.completedAt = completedAt;
    b.fulfillment.confirmationStatus = b.fulfillment.requiresCompletionConfirmation ? "awaiting" : "confirmed";
    b.fulfillment.customerConfirmedAt = b.fulfillment.requiresCompletionConfirmation ? undefined : completedAt;
    syncFulfillmentState(b, nowMs);
    if (!b.fulfillment.requiresCompletionConfirmation) {
      b.timeline.push({
        id: `${b.id}-tl-complete-${nowMs}`,
        kind: "completed",
        title: "Booking completed",
        message: "The provider completed this appointment.",
        createdAt: completedAt,
      });
      b.timeline.push({
        id: `${b.id}-tl-confirm-${nowMs}`,
        kind: "completion_confirmed",
        title: "Completion confirmed",
        message: "Automatically confirmed — your review window is now open.",
        createdAt: completedAt,
      });
    } else {
      b.timeline.push({
        id: `${b.id}-tl-awaiting-${nowMs}`,
        kind: "completed",
        title: "Booking completed",
        message: "The provider completed this appointment. Confirm the service to close the order.",
        createdAt: completedAt,
      });
    }
    return { status: "ok" };
  }, nowMs);
}

// ── Customer fulfilment actions (completion gate) ─────────────

export function confirmCompletionOnBackend(
  customerId: string,
  bookingId: string,
  nowMs = Date.now()
): BookingResult {
  const found = findBookingForOwner(bookingId, "customerId", customerId);
  if (!found.booking || found.err) return { ok: false, error: found.err! };

  const b = found.booking;
  if (b.status !== "completed") {
    return { ok: false, error: error("422", "This booking isn't completed yet.") };
  }
  if (!b.fulfillment.requiresCompletionConfirmation) {
    return { ok: false, error: error("422", "This booking is confirmed automatically — nothing to do.") };
  }
  if (b.fulfillment.confirmationStatus === "confirmed") return { ok: true, booking: cloneBooking(b) };
  if (b.fulfillment.confirmationStatus === "problem_reported") {
    return { ok: false, error: error("422", "An issue was already reported for this booking.") };
  }

  b.fulfillment.confirmationStatus = "confirmed";
  b.fulfillment.customerConfirmedAt = new Date(nowMs).toISOString();
  b.fulfillment.reviewEligibleUntil = reviewEligibleUntilAfter(b.fulfillment.completedAt ?? b.updatedAt);
  syncFulfillmentState(b, nowMs);
  b.updatedAt = new Date(nowMs).toISOString();
  b.timeline.push({
    id: `${b.id}-tl-confirm-${nowMs}`,
    kind: "completion_confirmed",
    title: "Completion confirmed",
    message: "You confirmed that the service was completed.",
    createdAt: b.updatedAt,
  });

  return { ok: true, booking: cloneBooking(b) };
}

export interface ReportProblemInput {
  category: ServiceProblemCategory;
  description: string;
  evidence?: BookingEvidence[];
}

export function reportProblemOnBackend(
  customerId: string,
  bookingId: string,
  input: ReportProblemInput,
  nowMs = Date.now()
): BookingResult {
  const found = findBookingForOwner(bookingId, "customerId", customerId);
  if (!found.booking || found.err) return { ok: false, error: found.err! };

  const b = found.booking;
  if (b.status !== "completed") {
    return { ok: false, error: error("422", "You can report an issue after the provider completes the service.") };
  }
  if (b.fulfillment.confirmationStatus === "confirmed") {
    return { ok: false, error: error("422", "You already confirmed this booking. Share feedback in your review or contact Kampmax support.") };
  }
  if (b.fulfillment.confirmationStatus === "problem_reported") {
    return { ok: false, error: error("422", "An issue was already reported for this booking.") };
  }
  if (!input.description.trim()) {
    return { ok: false, error: error("422", "Tell us a little more about the issue.", { field: "description" }) };
  }

  b.fulfillment.confirmationStatus = "problem_reported";
  b.fulfillment.problem = {
    category: input.category,
    description: input.description.trim(),
    evidence: input.evidence && input.evidence.length > 0 ? input.evidence : undefined,
    reportedAt: new Date(nowMs).toISOString(),
    assignedTo: PROBLEM_ASSIGNED_TO,
  };
  syncFulfillmentState(b, nowMs);
  b.updatedAt = new Date(nowMs).toISOString();
  b.timeline.push({
    id: `${b.id}-tl-problem-${nowMs}`,
    kind: "problem_reported",
    title: "Issue reported",
    message: "Your issue was reported to Kampmax support for review.",
    createdAt: b.updatedAt,
  });

  return { ok: true, booking: cloneBooking(b) };
}

export function submitBookingReviewOnBackend(
  customerId: string,
  bookingId: string,
  input: BookingReviewInput,
  nowMs = Date.now()
): BookingResult {
  const found = findBookingForOwner(bookingId, "customerId", customerId);
  if (!found.booking || found.err) return { ok: false, error: found.err! };

  const b = found.booking;
  const f = b.fulfillment;
  if (b.status !== "completed") {
    return { ok: false, error: error("422", "Reviews open after the booking is completed.") };
  }
  if (f.review) return { ok: true, booking: cloneBooking(b) };
  if (f.confirmationStatus !== "confirmed") {
    return { ok: false, error: error("422", "Confirm the service was completed — or report an issue — before leaving a review.") };
  }
  if (f.reviewEligibleUntil && new Date(f.reviewEligibleUntil).getTime() < nowMs) {
    return { ok: false, error: error("422", "The review window for this booking has closed.") };
  }

  f.review = { id: newEvidenceId(), submittedAt: new Date(nowMs).toISOString(), ...input };
  b.updatedAt = new Date(nowMs).toISOString();
  b.timeline.push({
    id: `${b.id}-tl-review-${nowMs}`,
    kind: "reviewed",
    title: "Review submitted",
    message: `You rated this booking ${input.rating}/5${input.title ? ` — “${input.title}”` : ""}.`,
    createdAt: b.updatedAt,
  });

  return { ok: true, booking: cloneBooking(b) };
}

// ── Queries (read-layer projections) ──────────────────────────

type ListQueryArg = BookingListFilter | ProviderBookingStatusFilter | BookingListQuery;

interface NormalizedQuery extends BookingListQuery {
  status: BookingListFilter | ProviderBookingStatusFilter;
  sort: BookingSort;
}

function normalizeQuery(arg: ListQueryArg, nowMs: number): NormalizedQuery {
  const q: BookingListQuery = typeof arg === "string" ? { status: arg } : arg;
  const status = q.status ?? "all";
  const sort = q.sort ?? (status === "upcoming" ? ("upcoming" as const) : ("newest" as const));
  return { ...q, status, sort };
}

function applyStatusFilter(list: ServiceBooking[], status: NormalizedQuery["status"], nowMs: number) {
  switch (status) {
    case "upcoming":
      return list.filter(
        (b) => ACTIVE_BOOKING_STATUSES.includes(b.status) && new Date(b.startAt).getTime() >= nowMs
      );
    case "past":
      return list.filter(
        (b) => b.status === "completed" || new Date(b.startAt).getTime() < nowMs
      );
    case "cancelled":
      return list.filter((b) => b.status === "cancelled" || b.status === "declined");
    case "pending":
      return list.filter((b) => b.status === "pending");
    case "in_progress":
      return list.filter((b) => b.status === "in_progress");
    case "completed":
      return list.filter((b) => b.status === "completed");
    default:
      return list;
  }
}

function applySearchFilter(list: ServiceBooking[], search: string | undefined) {
  if (!search?.trim()) return list;
  const needle = search.trim().toLowerCase();
  return list.filter((b) => {
    const providerName = providerById(b.providerId)?.displayName?.toLowerCase() ?? "";
    const customerName = b.customer?.name?.toLowerCase() ?? "";
    return (
      b.serviceName.toLowerCase().includes(needle) ||
      b.bookingReference.toLowerCase().includes(needle) ||
      customerName.includes(needle) ||
      providerName.includes(needle)
    );
  });
}

function sortBookings(list: ServiceBooking[], sort: BookingSort): void {
  const startKey = (b: ServiceBooking) => new Date(b.startAt).getTime();
  switch (sort) {
    case "oldest":
      list.sort((a, b) => startKey(a) - startKey(b));
      break;
    case "upcoming":
      list.sort((a, b) => startKey(a) - startKey(b));
      break;
    case "recently_completed":
      list.sort((a, b) => {
        const key = (x: ServiceBooking) =>
          x.status === "completed"
            ? new Date(x.fulfillment.completedAt ?? x.updatedAt).getTime()
            : Number.NEGATIVE_INFINITY;
        return key(b) - key(a);
      });
      break;
    default:
      list.sort((a, b) => startKey(b) - startKey(a));
  }
}

function runListQuery(
  base: ServiceBooking[],
  arg: ListQueryArg,
  nowMs: number
): ServiceBooking[] | BookingPageResult {
  const q = normalizeQuery(arg, nowMs);
  let list = applyStatusFilter(base, q.status, nowMs);
  list = applySearchFilter(list, q.search);

  if (q.serviceId) list = list.filter((b) => b.serviceId === q.serviceId);
  if (q.providerId) list = list.filter((b) => b.providerId === q.providerId);
  if (q.dateFrom || q.dateTo) {
    list = list.filter((b) => {
      const key = dayKeyOf(new Date(b.startAt).getTime());
      if (q.dateFrom && key < q.dateFrom) return false;
      if (q.dateTo && key > q.dateTo) return false;
      return true;
    });
  }

  sortBookings(list, q.sort);

  if (typeof q.page === "number" || typeof q.limit === "number") {
    const limit = Math.max(1, q.limit ?? 20);
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(Math.max(1, q.page ?? 1), totalPages);
    const start = (page - 1) * limit;
    return {
      items: list.slice(start, start + limit).map((b) => cloneBooking(b)),
      page,
      limit,
      total,
      totalPages,
    };
  }
  return list.map((b) => cloneBooking(b));
}

export function getBookingsForCustomer(customerId: string, filter: BookingListFilter): ServiceBooking[];
export function getBookingsForCustomer(customerId: string, query: BookingListQuery): BookingPageResult;
export function getBookingsForCustomer(
  customerId: string,
  arg: BookingListFilter | BookingListQuery,
  nowMs = Date.now()
): ServiceBooking[] | BookingPageResult {
  const base = store.bookings.filter((b) => b.customerId === customerId);
  return runListQuery(base, arg, nowMs);
}

export function getBookingForCustomer(
  customerId: string,
  bookingId: string
): ServiceBooking | null {
  const b = store.bookings.find((x) => x.id === bookingId && x.customerId === customerId);
  return b ? cloneBooking(b) : null;
}

export function getBookingsForProvider(
  providerId: string,
  filter: ProviderBookingStatusFilter
): ServiceBooking[];
export function getBookingsForProvider(providerId: string, query: BookingListQuery): BookingPageResult;
export function getBookingsForProvider(
  providerId: string,
  arg: ProviderBookingStatusFilter | BookingListQuery,
  nowMs = Date.now()
): ServiceBooking[] | BookingPageResult {
  const base = store.bookings.filter((b) => b.providerId === providerId);
  return runListQuery(base, arg, nowMs);
}

export function getBookingForProvider(
  providerId: string,
  bookingId: string
): ServiceBooking | null {
  const b = store.bookings.find((x) => x.id === bookingId && x.providerId === providerId);
  return b ? cloneBooking(b) : null;
}

export function getProviderBookingStats(providerId: string): {
  pending: number;
  upcomingToday: number;
  upcoming: number;
  inProgress: number;
  completed: number;
  cancelled: number;
} {
  const now = Date.now();
  const base = store.bookings.filter((b) => b.providerId === providerId);
  const upcoming = runListQuery(base, "upcoming", now) as ServiceBooking[];
  return {
    pending: (runListQuery(base, "pending", now) as ServiceBooking[]).length,
    upcomingToday: upcoming.filter((b) => dayKeyOf(new Date(b.startAt).getTime()) === dayKeyOf(now)).length,
    upcoming: upcoming.length,
    inProgress: (runListQuery(base, "in_progress", now) as ServiceBooking[]).length,
    completed: (runListQuery(base, "completed", now) as ServiceBooking[]).length,
    cancelled: (runListQuery(base, "cancelled", now) as ServiceBooking[]).length,
  };
}

export { BOOKING_TIME_ZONE };