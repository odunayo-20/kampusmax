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
  BookingLocation,
  BookingResult,
  BookingSlot,
  CancelBookingInput,
  DayAvailability,
  ProviderBookingDecision,
  RescheduleBookingInput,
  ServiceBooking,
} from "@/types/booking";
import {
  ACTIVE_BOOKING_STATUSES,
} from "@/types/booking";
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
    opts: Partial<ServiceBooking> & { cancelledBy?: ServiceBooking["cancelledBy"] }
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

    return {
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
    };
  };

  // Provider (sp1) calendar, incoming from other students.
  const providerBookings = [
    seed("msvc1", baseCustomer("Chioma Nwosu", "+234 813 456 7890", "chioma@rugipo.edu.ng", "u2"), "pending", 1, "10:00", "provider_location", {}),
    seed("msvc2", baseCustomer("Ibrahim Musa", "+234 814 567 8901", "ibrahim@rugipo.edu.ng", "u3"), "confirmed", 2, "11:00", "provider_location", {}),
    seed("msvc3", baseCustomer("Folashade Adeyemi", "+234 815 678 9012", "folashade@rugipo.edu.ng", "u4"), "confirmed", 3, "09:30", "online", {}),
    seed("msvc1", baseCustomer("Emeka Obi", "+234 816 789 0123", "emeka@rugipo.edu.ng", "u5"), "completed", -6, "14:00", "provider_location", {}),
    seed("msvc2", baseCustomer("Chioma Nwosu", "+234 813 456 7890", "chioma@rugipo.edu.ng", "u2"), "cancelled", 1, "14:00", "provider_location", { cancelledBy: "customer" }),
  ];

  // Customer (u1) history, on other providers.
  const customerBookings = [
    seed("msvc6", baseCustomer("Adebayo Oluwaseun", "+234 812 345 6789", "adebayo@rugipo.edu.ng", "u1"), "pending", 2, "13:00", "customer_location", {}),
    seed("msvc16", baseCustomer("Adebayo Oluwaseun", "+234 812 345 6789", "adebayo@rugipo.edu.ng", "u1"), "completed", -5, "07:00", "provider_location", {}),
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

export function completeBookingOnBackend(
  id: string,
  owner: { providerId: string },
  nowMs = Date.now()
): BookingResult {
  return providerBookingMutation(id, owner, (b) => {
    if (b.status === "completed") return { status: "ok" };
    if (b.status !== "confirmed" && b.status !== "in_progress") {
      return { status: "err", err: error("422", `A ${b.status} booking can't be completed.`) };
    }
    b.status = "completed";
    b.timeline.push({
      id: `${b.id}-tl-complete-${nowMs}`,
      kind: "completed",
      title: "Booking completed",
      message: "The provider completed this appointment.",
      createdAt: new Date(nowMs).toISOString(),
    });
    return { status: "ok" };
  }, nowMs);
}

// ── Queries (read-layer projections) ──────────────────────────

export function getBookingsForCustomer(
  customerId: string,
  filter: "upcoming" | "past" | "cancelled" | "all",
  nowMs = Date.now()
): ServiceBooking[] {
  let list = store.bookings.filter((b) => b.customerId === customerId);
  const now = nowMs;
  switch (filter) {
    case "upcoming":
      list = list.filter(
        (b) => ACTIVE_BOOKING_STATUSES.includes(b.status) && new Date(b.startAt).getTime() >= now
      );
      list.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
      break;
    case "past":
      list = list.filter(
        (b) => b.status === "completed" || new Date(b.startAt).getTime() < now
      );
      list.sort((a, b) => new Date(b.startAt).getTime() - new Date(b.startAt).getTime());
      break;
    case "cancelled":
      list = list.filter((b) => b.status === "cancelled" || b.status === "declined");
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(b.updatedAt).getTime());
      break;
    default:
      list.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
  }
  return list.map((b) => cloneBooking(b));
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
  filter: "pending" | "upcoming" | "completed" | "cancelled" | "all"
): ServiceBooking[] {
  let list = store.bookings.filter((b) => b.providerId === providerId);
  switch (filter) {
    case "pending":
      list = list.filter((b) => b.status === "pending");
      list.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
      break;
    case "upcoming":
      list = list.filter(
        (b) => b.status === "confirmed" || (b.status === "in_progress" && new Date(b.startAt).getTime() >= Date.now())
      );
      list.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
      break;
    case "completed":
      list = list.filter((b) => b.status === "completed");
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(b.updatedAt).getTime());
      break;
    case "cancelled":
      list = list.filter((b) => b.status === "cancelled" || b.status === "declined");
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(b.updatedAt).getTime());
      break;
    default:
      list.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
  }
  return list.map((b) => cloneBooking(b));
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
  completed: number;
} {
  const now = Date.now();
  return {
    pending: getBookingsForProvider(providerId, "pending").length,
    upcomingToday: getBookingsForProvider(providerId, "upcoming").filter(
      (b) => dayKeyOf(new Date(b.startAt).getTime()) === dayKeyOf(now)
    ).length,
    upcoming: getBookingsForProvider(providerId, "upcoming").length,
    completed: getBookingsForProvider(providerId, "completed").length,
  };
}

export { BOOKING_TIME_ZONE };