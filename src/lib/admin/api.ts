// ============================================================
// ADMIN DATA-ACCESS CORE
//
// ARCHITECTURE NOTE (NestJS swap point):
// Every admin service in `src/services/admin/*` implements a
// `<Resource>Service` interface and is resolved through
// `src/services/admin/container.ts`. Today the container wires
// mock implementations built on the helpers below. To move to
// the real backend, implement each interface with an HTTP
// client and change ONLY the container wiring - no UI changes.
//
// The shapes here intentionally mirror common NestJS patterns:
//   GET  /<resource>?page=&pageSize=&search=&sortBy=&sortDir=
//   -> Paginated<T>
// ============================================================

import { ListQuery, Paginated, SortDir } from "@/types/admin";

/** Simulates network latency for realistic loading states. */
export function apiDelay(ms = 220): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function paginate<T>(
  items: T[],
  query: ListQuery,
  defaultPageSize = 10
): Paginated<T> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, query.pageSize ?? defaultPageSize);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

export function applySearch<T>(
  items: T[],
  search: string | undefined,
  fields: (item: T) => (string | number | null | undefined)[]
): T[] {
  const q = search?.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) =>
    fields(item).some((v) => String(v ?? "").toLowerCase().includes(q))
  );
}

type SortAccessor<T> = (item: T) => string | number;

export function applySort<T>(
  items: T[],
  sortBy: string | undefined,
  sortDir: SortDir = "desc",
  accessors: Record<string, SortAccessor<T>>,
  fallbackKey?: keyof T & string
): T[] {
  const key = sortBy && accessors[sortBy] ? sortBy : fallbackKey;
  if (!key) return items;
  const accessor = accessors[key]!;
  const dir = sortDir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const av = accessor(a);
    const bv = accessor(b);
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

export function inDateRange(
  isoDate: string,
  from: string | undefined,
  to: string | undefined
): boolean {
  const t = new Date(isoDate).getTime();
  if (from && t < new Date(`${from}T00:00:00`).getTime()) return false;
  if (to && t > new Date(`${to}T23:59:59`).getTime()) return false;
  return true;
}

// ------------------------------------------------------------
// DETERMINISTIC MOCK GENERATION UTILITIES
// (stable data across reloads - no Math.random in mocks)
// ------------------------------------------------------------

/** Small deterministic PRNG so generated mock data never shifts between renders. */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function intBetween(
  rand: () => number,
  min: number,
  max: number
): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

/** ISO timestamp `days` in the past with a stable pseudo-random time of day. */
export function daysAgoIso(rand: () => number, days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(intBetween(rand, 8, 21), intBetween(rand, 0, 59), 0, 0);
  return d.toISOString();
}
