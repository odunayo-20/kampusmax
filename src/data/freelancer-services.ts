// ============================================================
// FREELANCER SERVICES DATA STORE  (Module 23B)
// ============================================================
// In-memory mock store for freelancer-owned services, simulating what the
// future NestJS API would persist. Backend-authoritative:
//   - Service status/visibility are ONLY transitioned by the store (the
//     simulated backend), never by the client.
//   - All collections are keyed by owner userId; reads/writes are owner-scoped
//     by the service layer using getCurrentUser().id (IDOR/BOLA-safe).
//
// Portfolio data is intentionally NOT duplicated here — it reuses the
// FreelancerPortfolioItem[] already owned by the freelancer onboarding draft
// store so there is a single source of truth.

import type {
  FreelancerService,
  FreelancerServiceInput,
  FreelancerServiceStatus,
} from "@/types/freelancer-services";
import { FREELANCER_SERVICE_STATUS } from "@/types/freelancer-services";

// ── Store ───────────────────────────────────────────────────

interface ServiceStoreRecord {
  ownerId: string;
  services: FreelancerService[];
}

const store = new Map<string, ServiceStoreRecord>();

// ── Helpers ─────────────────────────────────────────────────

function nowIso(): string {
  return new Date().toISOString();
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

function freshId(): string {
  return `fls_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function cloneService(s: FreelancerService): FreelancerService {
  return { ...s, skills: [...s.skills], deliverables: [...s.deliverables] };
}

function cloneList(list: FreelancerService[]): FreelancerService[] {
  return list.map(cloneService);
}

// ── Factory — builds a stored service from a whitelisted input ──
// The input only contains client-editable fields; id/ownerId/status/visibility/
// timestamps/statistics are assigned by the store (backend).

function buildService(ownerId: string, input: FreelancerServiceInput): FreelancerService {
  const now = nowIso();
  return {
    id: freshId(),
    userId: ownerId,
    title: input.title.trim(),
    categoryId: input.categoryId,
    skills: [...input.skills],
    shortDescription: input.shortDescription.trim(),
    description: input.description.trim(),
    pricing: input.pricing,
    price: input.price,
    priceMax: input.priceMax,
    deliveryValue: input.deliveryValue,
    deliveryUnit: input.deliveryUnit,
    revisions: input.revisions,
    deliverables: [...input.deliverables],
    coverImageUrl: input.coverImageUrl,
    status: FREELANCER_SERVICE_STATUS.DRAFT,
    visibility: "hidden",
    createdAt: now,
    updatedAt: now,
  };
}

function cloneDraftFromService(s: FreelancerService): FreelancerServiceInput {
  return {
    title: s.title,
    categoryId: s.categoryId,
    skills: [...s.skills],
    shortDescription: s.shortDescription,
    description: s.description,
    pricing: s.pricing,
    price: s.price,
    priceMax: s.priceMax,
    deliveryValue: s.deliveryValue,
    deliveryUnit: s.deliveryUnit,
    revisions: s.revisions,
    deliverables: [...s.deliverables],
    coverImageUrl: s.coverImageUrl,
  };
}

// ── Seed data (demo owner = current user, id "u1") ──────────
// Matches the freelancer/store seeding convention. A fresh user (any id other
// than the demo owner) starts with an empty services list via ensureOwner.

const DEMO_SERVICES_OWNER = "u1";

function seedServices(): FreelancerService[] {
  return [
    {
      id: "fls_demo1",
      userId: DEMO_SERVICES_OWNER,
      title: "Full-Stack Web Development",
      categoryId: "fc1",
      skills: ["React", "Next.js", "TypeScript", "Node.js"],
      shortDescription:
        "End-to-end web apps, from landing pages to complete MVPs with authentication, payments and admin dashboards.",
      description:
        "I build modern, responsive web applications for students and growing businesses. Everything from a landing page to a full-stack MVP with authentication, payments and an admin dashboard. I follow best practices for performance, accessibility and security.",
      pricing: "project",
      price: 250000,
      deliveryValue: 2,
      deliveryUnit: "weeks",
      revisions: 2,
      deliverables: ["Source code", "Deployment", "Documentation", "1 month support"],
      status: FREELANCER_SERVICE_STATUS.PUBLISHED,
      visibility: "visible",
      createdAt: daysAgo(20),
      updatedAt: daysAgo(6),
      viewCount: 142,
      orderCount: 4,
    },
    {
      id: "fls_demo2",
      userId: DEMO_SERVICES_OWNER,
      title: "Mobile App Development (React Native)",
      categoryId: "fc2",
      skills: ["React Native", "TypeScript", "Expo"],
      shortDescription: "Cross-platform iOS & Android apps built fast with one codebase.",
      description:
        "Native-feel mobile apps for both iOS and Android from a single React Native codebase. Includes push notifications, offline support and app store submission guidance.",
      pricing: "starting_at",
      price: 350000,
      priceMax: 900000,
      deliveryValue: 4,
      deliveryUnit: "weeks",
      revisions: 3,
      deliverables: ["App source code", "App store build", "API integration"],
      status: FREELANCER_SERVICE_STATUS.PUBLISHED,
      visibility: "visible",
      createdAt: daysAgo(15),
      updatedAt: daysAgo(3),
      viewCount: 88,
      orderCount: 2,
    },
    {
      id: "fls_demo3",
      userId: DEMO_SERVICES_OWNER,
      title: "Next.js Maintenance & Support",
      categoryId: "fc1",
      skills: ["Next.js", "TypeScript", "Node.js"],
      shortDescription: "Ongoing support, bug fixes and feature updates for existing Next.js apps.",
      description: "Draft of an ongoing support offering for existing Next.js projects.",
      pricing: "hourly",
      price: 15000,
      deliveryUnit: "days",
      revisions: 1,
      deliverables: ["Bug fixes", "Feature updates"],
      status: FREELANCER_SERVICE_STATUS.DRAFT,
      visibility: "hidden",
      createdAt: daysAgo(5),
      updatedAt: daysAgo(2),
      viewCount: 0,
      orderCount: 0,
    },
  ];
}

// ── Register the demo owner at module load ──────────────────
store.set(DEMO_SERVICES_OWNER, { ownerId: DEMO_SERVICES_OWNER, services: seedServices() });

// ── Store API (low-level; ownership enforced by the service layer) ──

export function ensureOwnerRecord(ownerId: string): void {
  if (!store.has(ownerId)) {
    store.set(ownerId, { ownerId, services: [] });
  }
}

export function getServicesRecord(ownerId: string): FreelancerService[] {
  const rec = store.get(ownerId);
  return rec ? cloneList(rec.services) : [];
}

export function getServiceById(ownerId: string, serviceId: string): FreelancerService | null {
  const rec = store.get(ownerId);
  if (!rec) return null;
  const found = rec.services.find((s) => s.id === serviceId);
  return found ? cloneService(found) : null;
}

export function createServiceRecord(ownerId: string, input: FreelancerServiceInput): FreelancerService {
  ensureOwnerRecord(ownerId);
  const rec = store.get(ownerId)!;
  const service = buildService(ownerId, input);
  rec.services.unshift(service);
  return cloneService(service);
}

export function updateServiceRecord(
  ownerId: string,
  serviceId: string,
  input: FreelancerServiceInput
): FreelancerService | null {
  const rec = store.get(ownerId);
  if (!rec) return null;
  const idx = rec.services.findIndex((s) => s.id === serviceId);
  if (idx === -1) return null;
  const merged: FreelancerService = {
    ...rec.services[idx],
    title: input.title.trim(),
    categoryId: input.categoryId,
    skills: [...input.skills],
    shortDescription: input.shortDescription.trim(),
    description: input.description.trim(),
    pricing: input.pricing,
    price: input.price,
    priceMax: input.priceMax,
    deliveryValue: input.deliveryValue,
    deliveryUnit: input.deliveryUnit,
    revisions: input.revisions,
    deliverables: [...input.deliverables],
    coverImageUrl: input.coverImageUrl,
    updatedAt: nowIso(),
  };
  rec.services[idx] = merged;
  return cloneService(merged);
}

// ── Backend-owned status transitions ────────────────────────
// These are the ONLY writers of status/visibility. The client never sets
// them directly; it requests an action and the backend resolves the result.

function transitionStatus(
  ownerId: string,
  serviceId: string,
  next: FreelancerServiceStatus
): { ok: boolean; status?: FreelancerServiceStatus } {
  const rec = store.get(ownerId);
  if (!rec) return { ok: false, status: undefined };
  const idx = rec.services.findIndex((s) => s.id === serviceId);
  if (idx === -1) return { ok: false, status: undefined };
  rec.services[idx].status = next;
  rec.services[idx].visibility =
    next === FREELANCER_SERVICE_STATUS.PUBLISHED ? "visible" : "hidden";
  if (next === FREELANCER_SERVICE_STATUS.PAUSED) rec.services[idx].visibility = "hidden";
  rec.services[idx].updatedAt = nowIso();
  return { ok: true, status: next };
}

// Every transition returns the same shape so the service layer can rely on
// `res.status` being present once `res.ok` is established.

type TransitionResult = {
  ok: boolean;
  code: "ok" | "review" | "not_found" | "conflict";
  status?: FreelancerServiceStatus;
};

function failure(code: TransitionResult["code"]): TransitionResult {
  return { ok: false, code, status: undefined };
}

export function publishServiceRecord(ownerId: string, serviceId: string): TransitionResult {
  const rec = store.get(ownerId);
  if (!rec) return failure("not_found");
  const s = rec.services.find((x) => x.id === serviceId);
  if (!s) return failure("not_found");
  // Backend resolves: DRAFT/REJECTED → SUBMITTED → UNDER_REVIEW.
  // We simulate approval instantly for the prototype, but the store is the
  // authority — the client never forces "published".
  if (s.status === FREELANCER_SERVICE_STATUS.DRAFT || s.status === FREELANCER_SERVICE_STATUS.REJECTED) {
    const t = transitionStatus(ownerId, serviceId, FREELANCER_SERVICE_STATUS.UNDER_REVIEW);
    return { ok: t.ok, code: "review", status: t.status };
  }
  return failure("conflict");
}

export function approveServiceRecord(ownerId: string, serviceId: string): TransitionResult {
  // Simulates the backend finishing its review of a service currently
  // in SUBMITTED/UNDER_REVIEW and moving it to PUBLISHED.
  const rec = store.get(ownerId);
  if (!rec) return failure("not_found");
  const s = rec.services.find((x) => x.id === serviceId);
  if (!s) return failure("not_found");
  if (
    s.status === FREELANCER_SERVICE_STATUS.SUBMITTED ||
    s.status === FREELANCER_SERVICE_STATUS.UNDER_REVIEW
  ) {
    const t = transitionStatus(ownerId, serviceId, FREELANCER_SERVICE_STATUS.PUBLISHED);
    return { ok: t.ok, code: "ok", status: t.status };
  }
  return failure("conflict");
}

export function pauseServiceRecord(ownerId: string, serviceId: string): TransitionResult {
  const rec = store.get(ownerId);
  if (!rec) return failure("not_found");
  const s = rec.services.find((x) => x.id === serviceId);
  if (!s) return failure("not_found");
  if (s.status === FREELANCER_SERVICE_STATUS.PUBLISHED) {
    const t = transitionStatus(ownerId, serviceId, FREELANCER_SERVICE_STATUS.PAUSED);
    return { ok: t.ok, code: "ok", status: t.status };
  }
  return failure("conflict");
}

export function resumeServiceRecord(ownerId: string, serviceId: string): TransitionResult {
  const rec = store.get(ownerId);
  if (!rec) return failure("not_found");
  const s = rec.services.find((x) => x.id === serviceId);
  if (!s) return failure("not_found");
  if (s.status === FREELANCER_SERVICE_STATUS.PAUSED) {
    // Resuming returns a paused service to backend review before it can be
    // published again. (Store authoritative.)
    const t = transitionStatus(ownerId, serviceId, FREELANCER_SERVICE_STATUS.UNDER_REVIEW);
    return { ok: t.ok, code: "review", status: t.status };
  }
  return failure("conflict");
}

export function archiveServiceRecord(ownerId: string, serviceId: string): TransitionResult {
  const rec = store.get(ownerId);
  if (!rec) return failure("not_found");
  const s = rec.services.find((x) => x.id === serviceId);
  if (!s) return failure("not_found");
  if (s.status === FREELANCER_SERVICE_STATUS.PUBLISHED || s.status === FREELANCER_SERVICE_STATUS.PAUSED) {
    const t = transitionStatus(ownerId, serviceId, FREELANCER_SERVICE_STATUS.ARCHIVED);
    return { ok: t.ok, code: "ok", status: t.status };
  }
  return failure("conflict");
}

export function deleteServiceRecord(ownerId: string, serviceId: string): boolean {
  const rec = store.get(ownerId);
  if (!rec) return false;
  const idx = rec.services.findIndex((s) => s.id === serviceId);
  if (idx === -1) return false;
  rec.services.splice(idx, 1);
  return true;
}

export { freshId };
