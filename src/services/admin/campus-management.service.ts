import {
  Campus,
  CampusActivityEvent,
  CampusAdminAssignment,
  CampusAdminInput,
  CampusCreateInput,
  CampusStatusCounts,
  ListQuery,
  ManagedCampus,
  ManagedCampusDetail,
  Paginated,
} from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";
import {
  buildManagedCampusDataset,
  type ManagedCampusDataset,
} from "@/data/admin/campus-management";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/campuses)
// ------------------------------------------------------------

export type ManagedCampusSortField =
  | "name"
  | "createdAt"
  | "usersCount"
  | "ordersCount"
  | "revenue";

export interface ManagedCampusListFilters {
  state?: string | "all";
  status?: Campus["status"] | "all";
}

export interface ManagedCampusListQuery extends ListQuery, ManagedCampusListFilters {}

export interface AdminCampusManagementService {
  list(query?: ManagedCampusListQuery): Promise<Paginated<ManagedCampus>>;
  getById(id: string): Promise<ManagedCampusDetail | null>;
  getCounts(): Promise<CampusStatusCounts>;
  getStates(): Promise<string[]>;
  create(input: CampusCreateInput): Promise<ManagedCampus>;
  update(id: string, patch: Partial<CampusCreateInput>): Promise<ManagedCampus>;
  setStatus(id: string, status: Campus["status"]): Promise<ManagedCampus>;
  assignAdmin(campusId: string, admin: CampusAdminInput): Promise<ManagedCampus>;
  removeAdmin(campusId: string, adminId: string): Promise<ManagedCampus>;
  getActivity(id: string): Promise<CampusActivityEvent[]>;
}

// ------------------------------------------------------------
// MOCK IMPLEMENTATION
// ------------------------------------------------------------

export function createCampusManagementService(
  seed?: ManagedCampusDataset
): AdminCampusManagementService {
  const dataset = seed ?? buildManagedCampusDataset();
  const campuses = dataset.campuses.map((c) => ({ ...c }));
  const details = new Map<string, ManagedCampusDetail>();
  // Deep-copy details so module-level mock data stays pristine.
  dataset.details.forEach((detail, id) =>
    details.set(id, structuredCopy(detail))
  );
  let createdCount = 0;

  function findOrThrow(id: string): ManagedCampus {
    const campus = campuses.find((c) => c.id === id);
    if (!campus) throw new Error(`Campus ${id} not found`);
    return campus;
  }

  function syncDetail(id: string): void {
    const detail = details.get(id);
    if (detail) detail.campus = { ...findOrThrow(id), admins: [...findOrThrow(id).admins] };
    if (detail) detail.stats = recomputeStats(detail.campus);
  }

  function logActivity(campusId: string, message: string, meta = "Admin console"): void {
    const detail = details.get(campusId);
    if (!detail) return;
    detail.activity.unshift({
      id: `cact-${campusId}-admin-${detail.activity.length + 1}`,
      kind: "admin",
      message,
      meta,
      at: new Date().toISOString(),
    });
  }

  return {
    async list(query = {}) {
      await apiDelay();
      const {
        search,
        sortBy,
        sortDir = "desc",
        page = 1,
        pageSize = 10,
        state = "all",
        status = "all",
      } = query;

      let rows = campuses.filter(
        (c) =>
          (state === "all" || c.state === state) &&
          (status === "all" || c.status === status)
      );

      rows = applySearch(rows, search, (c) => [
        c.name,
        c.institution,
        c.shortName,
        c.city,
        c.state,
        c.id,
      ]);

      rows = applySort(
        rows,
        sortBy,
        sortDir,
        {
          name: (c) => c.name.toLowerCase(),
          createdAt: (c) => new Date(c.createdAt).getTime(),
          usersCount: (c) => c.usersCount,
          ordersCount: (c) => c.ordersCount,
          revenue: (c) => c.revenue,
        },
        "createdAt"
      );

      return paginate(rows, { page, pageSize });
    },

    async getById(id) {
      await apiDelay(160);
      return details.get(id) ?? null;
    },

    async getCounts() {
      await apiDelay(80);
      return {
        all: campuses.length,
        active: campuses.filter((c) => c.status === "active").length,
        inactive: campuses.filter((c) => c.status === "inactive").length,
      };
    },

    async getStates() {
      await apiDelay(60);
      return [...new Set(campuses.map((c) => c.state))].sort();
    },

    async create(input) {
      await apiDelay();
      const slug =
        input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `campus-${++createdCount}`;
      let id = `cmp-${slug}`;
      while (campuses.some((c) => c.id === id)) id = `cmp-${slug}-${++createdCount}`;

      const campus: ManagedCampus = {
        id,
        name: input.name.trim(),
        institution: input.institution.trim(),
        shortName: deriveShortName(input.name),
        state: input.state.trim(),
        city: input.city.trim(),
        address: input.address?.trim() ?? "",
        description: input.description?.trim() ?? "",
        logo: input.logo?.trim() || null,
        status: input.status,
        usersCount: 0,
        activeUsersCount: 0,
        vendorsCount: 0,
        productsCount: 0,
        ordersCount: 0,
        revenue: 0,
        admins: [],
        createdAt: new Date().toISOString(),
      };
      campuses.unshift(campus);
      details.set(
        campus.id,
        structuredCopy({
          campus,
          stats: recomputeStats(campus),
          activity: [],
        })
      );
      logActivity(
        campus.id,
        `Campus onboarded to Kampmax \u00b7 ${campus.institution}`
      );
      return campus;
    },

    async update(id, patch) {
      await apiDelay();
      const idx = campuses.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error(`Campus ${id} not found`);
      campuses[idx] = { ...campuses[idx], ...patch };
      syncDetail(id);
      logActivity(id, "Campus profile updated by platform admin");
      return campuses[idx];
    },

    async setStatus(id, status) {
      await apiDelay();
      const idx = campuses.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error(`Campus ${id} not found`);
      campuses[idx] = { ...campuses[idx], status };
      syncDetail(id);
      logActivity(
        id,
        status === "active"
          ? "Campus activated \u00b7 marketplace open for trading"
          : "Campus deactivated \u00b7 marketplace paused"
      );
      return campuses[idx];
    },

    async assignAdmin(campusId, admin) {
      await apiDelay();
      const idx = campuses.findIndex((c) => c.id === campusId);
      if (idx === -1) throw new Error(`Campus ${campusId} not found`);

      const email = admin.email.trim().toLowerCase();
      if (
        campuses[idx].admins.some((a) => a.email.toLowerCase() === email)
      ) {
        throw new Error("This email is already assigned as a campus admin.");
      }

      const assignment: CampusAdminAssignment = {
        id: `adm-${campusId}-${Date.now().toString(36)}`,
        name: admin.name.trim(),
        email,
        phone: admin.phone.trim(),
        status: "invited",
        assignedAt: new Date().toISOString(),
      };
      campuses[idx] = {
        ...campuses[idx],
        admins: [...campuses[idx].admins, assignment],
      };
      syncDetail(campusId);
      logActivity(
        campusId,
        `${assignment.name} invited as campus admin`,
        "Access control"
      );
      return campuses[idx];
    },

    async removeAdmin(campusId, adminId) {
      await apiDelay();
      const idx = campuses.findIndex((c) => c.id === campusId);
      if (idx === -1) throw new Error(`Campus ${campusId} not found`);
      const removed = campuses[idx].admins.find((a) => a.id === adminId);
      if (!removed) throw new Error(`Admin ${adminId} not found on ${campusId}`);

      campuses[idx] = {
        ...campuses[idx],
        admins: campuses[idx].admins.filter((a) => a.id !== adminId),
      };
      syncDetail(campusId);
      logActivity(
        campusId,
        `${removed.name} removed as campus admin`,
        "Access control"
      );
      return campuses[idx];
    },

    async getActivity(id) {
      await apiDelay(120);
      return details.get(id)?.activity ?? [];
    },
  };
}

function deriveShortName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0]!.slice(0, 6).toUpperCase();
  return words
    .slice(0, 5)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

function recomputeStats(campus: ManagedCampus) {
  return {
    totalStudents: Math.round(campus.usersCount / 0.085),
    totalUsers: campus.usersCount,
    activeUsers: campus.activeUsersCount,
    vendors: campus.vendorsCount,
    products: campus.productsCount,
    orders: campus.ordersCount,
    revenue: campus.revenue,
    adminsCount: campus.admins.length,
  };
}

/** Structured clone with Date-free plain objects only. */
function structuredCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
