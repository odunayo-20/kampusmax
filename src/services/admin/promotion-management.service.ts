import { apiDelay, applySearch, paginate } from "@/lib/admin/api";
import { buildPromotionManagementDataset } from "@/data/admin/promotion-management";
import { mockCampuses } from "@/data/admin/campuses";
import { mockVendors } from "@/data/admin/people";
import { mockCategories, mockProducts } from "@/data/admin/catalog";
import type {
  ManagedPromotion,
  ManagedPromotionStatus,
  Paginated,
  PromotionInput,
  PromotionListQuery,
  PromotionStatusCounts,
  PromotionTargetingOptions,
} from "@/types/admin";

export interface AdminPromotionManagementService {
  list(query?: PromotionListQuery): Promise<Paginated<ManagedPromotion>>;
  getCounts(): Promise<PromotionStatusCounts>;
  getTargetingOptions(): Promise<PromotionTargetingOptions>;
  create(input: PromotionInput): Promise<ManagedPromotion>;
  update(id: string, patch: Partial<PromotionInput>): Promise<ManagedPromotion>;
  setStatus(id: string, status: ManagedPromotionStatus): Promise<ManagedPromotion>;
  remove(id: string): Promise<void>;
}

function structuredCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const PAGE_SIZE = 15;

/** Statuses that may legally follow the given status. */
const TRANSITIONS: Record<
  ManagedPromotionStatus,
  readonly ManagedPromotionStatus[]
> = {
  draft: ["scheduled", "active"],
  scheduled: ["active", "paused", "draft", "ended"],
  active: ["paused", "ended"],
  paused: ["active", "ended"],
  ended: [],
};

function validate(
  input: Partial<PromotionInput>,
  rows: ManagedPromotion[],
  selfId?: string
): string[] {
  const errors: string[] = [];
  if (input.name !== undefined && input.name.trim().length < 3) {
    errors.push("Give the promotion a name (at least 3 characters).");
  }
  if (input.startsAt && input.endsAt) {
    if (new Date(input.endsAt).getTime() <= new Date(input.startsAt).getTime()) {
      errors.push("End date must be after the start date.");
    }
  }
  if (input.type === "promo_code") {
    const code = (input.code ?? "").trim().toUpperCase();
    if (code.length < 4) {
      errors.push("Promo codes need at least 4 characters.");
    } else if (
      rows.some(
        (r) => r.id !== selfId && (r.code ?? "").toUpperCase() === code
      )
    ) {
      errors.push(`Code ${code} is already used by another promotion.`);
    }
  }
  if (input.discountValue != null) {
    if (input.type === "percentage_discount" && (input.discountValue < 1 || input.discountValue > 90)) {
      errors.push("Percentage discounts must be between 1% and 90%.");
    }
    if (input.type === "fixed_discount" && input.discountValue < 100) {
      errors.push("Fixed discounts must be at least N100.");
    }
    if (input.type === "promo_code" && (input.discountValue < 1 || input.discountValue > 90)) {
      errors.push("Promo code discounts must be between 1% and 90%.");
    }
  }
  const t = input.targeting;
  if (t) {
    if (input.type === "featured_product" && t.productIds.length === 0) {
      errors.push("Pick at least one product to feature.");
    }
    if (input.type === "featured_vendor" && t.vendorIds.length === 0) {
      errors.push("Pick at least one vendor to feature.");
    }
    if (input.type === "campus_promotion" && t.campusIds.length === 0) {
      errors.push("Pick at least one campus for a campus promotion.");
    }
  }
  if (input.usageLimit != null && input.usageLimit < 1) {
    errors.push("Usage limit must be at least 1.");
  }
  return errors;
}

export function createPromotionManagementService(
  seed?: ManagedPromotion[]
): AdminPromotionManagementService {
  let rows: ManagedPromotion[] = seed
    ? structuredCopy(seed)
    : buildPromotionManagementDataset();
  let nextId = rows.length + 1;

  function requireRow(id: string): ManagedPromotion {
    const row = rows.find((r) => r.id === id.trim().toLowerCase());
    if (!row) throw new Error("Promotion not found. It may have been deleted.");
    return row;
  }

  function touch(row: ManagedPromotion) {
    row.updatedAt = new Date().toISOString();
  }

  /** Derive draft/scheduled/active/ended purely from the calendar. */
  function deriveWindowStatus(
    row: ManagedPromotion
  ): ManagedPromotionStatus {
    if (row.status === "draft" || row.status === "paused") return row.status;
    const now = Date.now();
    if (new Date(row.startsAt).getTime() > now) return "scheduled";
    if (new Date(row.endsAt).getTime() < now) return "ended";
    return "active";
  }

  return {
    async list(query = {}) {
      await apiDelay();
      const {
        search,
        type = "all",
        status = "all",
        campusId = "all",
        sortBy = "startsAt",
        sortDir = "desc",
        page = 1,
        pageSize = PAGE_SIZE,
      } = query;

      let out = rows.filter(
        (p) =>
          (type === "all" || p.type === type) &&
          (status === "all" || p.status === status) &&
          (campusId === "all" || p.targeting.campusIds.includes(campusId))
      );

      out = applySearch(out, search, (p) => [
        p.name,
        p.code ?? "",
        p.description,
      ]);

      const dirFactor = sortDir === "desc" ? -1 : 1;
      out.sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name) * dirFactor;
          case "endsAt":
            return (
              (new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()) *
              dirFactor
            );
          case "usageCount":
            return (a.usageCount - b.usageCount) * dirFactor;
          default:
            return (
              (new Date(a.startsAt).getTime() -
                new Date(b.startsAt).getTime()) *
              dirFactor
            );
        }
      });

      return paginate(out, { page, pageSize }, PAGE_SIZE);
    },

    async getCounts() {
      await apiDelay();
      const byStatus = {
        draft: 0,
        scheduled: 0,
        active: 0,
        paused: 0,
        ended: 0,
      } as Record<ManagedPromotionStatus, number>;
      const now = Date.now();
      let liveNow = 0;
      for (const row of rows) {
        byStatus[row.status] += 1;
        if (
          new Date(row.startsAt).getTime() <= now &&
          new Date(row.endsAt).getTime() >= now &&
          (row.status === "active" || row.status === "paused")
        ) {
          liveNow += 1;
        }
      }
      return { all: rows.length, byStatus, liveNow };
    },

    async getTargetingOptions() {
      await apiDelay();
      return {
        campuses: mockCampuses.map((c) => ({ id: c.id, name: c.shortName })),
        vendors: mockVendors
          .filter((v) => v.status === "approved")
          .map((v) => ({ id: v.id, name: v.storeName })),
        products: mockProducts
          .filter((p) => p.status === "available")
          .map((p) => ({ id: p.id, name: p.title })),
        categories: mockCategories
          .filter((c) => c.status === "active")
          .map((c) => ({ id: c.id, name: c.name })),
      };
    },

    async create(input) {
      await apiDelay();
      const errors = validate(input, rows);
      if (errors.length > 0) throw new Error(errors[0]);

      const now = new Date().toISOString();
      const row: ManagedPromotion = {
        id: `prm-${String(nextId++).padStart(3, "0")}`,
        name: input.name.trim(),
        description: input.description.trim(),
        type: input.type,
        status: "draft",
        code:
          input.type === "promo_code"
            ? (input.code ?? "").trim().toUpperCase()
            : null,
        discountValue: input.discountValue,
        minSpend: input.minSpend,
        placement: input.placement,
        targeting: structuredCopy(input.targeting),
        usageCount: 0,
        usageLimit: input.usageLimit,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        createdAt: now,
        updatedAt: now,
      };
      row.status = deriveWindowStatus(row);
      rows.unshift(row);
      return structuredCopy(row);
    },

    async update(id, patch) {
      await apiDelay();
      const row = requireRow(id);
      const errors = validate({ ...row, ...patch }, rows, row.id);
      if (errors.length > 0) throw new Error(errors[0]);

      if (patch.name !== undefined) row.name = patch.name.trim();
      if (patch.description !== undefined)
        row.description = patch.description.trim();
      if (patch.code !== undefined)
        row.code =
          row.type === "promo_code"
            ? patch.code?.trim().toUpperCase() ?? null
            : null;
      if (patch.discountValue !== undefined)
        row.discountValue = patch.discountValue;
      if (patch.minSpend !== undefined) row.minSpend = patch.minSpend;
      if (patch.placement !== undefined) row.placement = patch.placement;
      if (patch.targeting !== undefined)
        row.targeting = structuredCopy(patch.targeting);
      if (patch.usageLimit !== undefined) row.usageLimit = patch.usageLimit;
      if (patch.startsAt !== undefined) row.startsAt = patch.startsAt;
      if (patch.endsAt !== undefined) row.endsAt = patch.endsAt;

      row.status = deriveWindowStatus(row);
      touch(row);
      return structuredCopy(row);
    },

    async setStatus(id, status) {
      await apiDelay();
      const row = requireRow(id);
      const allowed = TRANSITIONS[row.status];
      if (!allowed.includes(status)) {
        throw new Error(
          `A ${row.status} promotion cannot move to ${status}. Allowed next steps: ${
            allowed.length > 0 ? allowed.join(", ") : "none - it is final"
          }.`
        );
      }
      row.status = status;
      touch(row);
      return structuredCopy(row);
    },

    async remove(id) {
      await apiDelay();
      const row = requireRow(id);
      if (row.status === "active") {
        throw new Error("Pause or end an active promotion before deleting it.");
      }
      rows = rows.filter((r) => r.id !== row.id);
    },
  };
}
