import {
  ListQuery,
  ManagedUser,
  ManagedUserDetail,
  ManagedUserStatus,
  ManagedUserUpdateInput,
  Paginated,
  UserActivityEvent,
  UserStatusCounts,
} from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";
import {
  buildManagedUserDataset,
  type ManagedUserDataset,
} from "@/data/admin/user-management";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/users)
// ------------------------------------------------------------

export type ManagedUserSortField =
  | "name"
  | "joinedAt"
  | "lastActiveAt"
  | "ordersCount"
  | "totalSpent";

export interface ManagedUserListFilters {
  role?: ManagedUser["role"] | "all";
  campusId?: string | "all";
  status?: ManagedUserStatus | "all";
}

export interface ManagedUserListQuery extends ListQuery, ManagedUserListFilters {}

export interface AdminUserManagementService {
  list(query?: ManagedUserListQuery): Promise<Paginated<ManagedUser>>;
  getById(id: string): Promise<ManagedUserDetail | null>;
  getCounts(): Promise<UserStatusCounts>;
  update(id: string, patch: ManagedUserUpdateInput): Promise<ManagedUser>;
  setStatus(id: string, status: ManagedUserStatus): Promise<ManagedUser>;
  resetAccountState(id: string): Promise<ManagedUser>;
  getActivity(id: string): Promise<UserActivityEvent[]>;
}

// ------------------------------------------------------------
// MOCK IMPLEMENTATION
// ------------------------------------------------------------

function createDataset(): ManagedUserDataset {
  return buildManagedUserDataset();
}

export function createUserManagementService(
  seed?: ManagedUserDataset
): AdminUserManagementService {
  const dataset = seed ?? createDataset();
  const users = dataset.users.map((u) => ({ ...u }));
  const details = new Map<string, ManagedUserDetail>();
  // Deep-copy details so module-level mock data stays pristine.
  dataset.details.forEach((detail, id) => details.set(id, structuredCopy(detail)));

  function findOrThrow(id: string): ManagedUser {
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error(`User ${id} not found`);
    return user;
  }

  function syncDetail(id: string): void {
    const detail = details.get(id);
    const user = users.find((u) => u.id === id);
    if (detail && user) detail.user = { ...user };
  }

  function logActivity(id: string, message: string): void {
    const detail = details.get(id);
    if (!detail) return;
    detail.activity.unshift({
      id: `act-${id}-admin-${detail.activity.length + 1}`,
      kind: "admin",
      message,
      meta: "Admin console",
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
        role = "all",
        campusId = "all",
        status = "all",
      } = query;

      let rows = users.filter(
        (u) =>
          (role === "all" || u.role === role) &&
          (campusId === "all" || u.campusId === campusId) &&
          (status === "all" || u.status === status)
      );

      rows = applySearch(rows, search, (u) => [
        u.name,
        u.email,
        u.phone,
        u.id,
        u.vendorProfile?.storeName,
      ]);

      rows = applySort(
        rows,
        sortBy,
        sortDir,
        {
          name: (u) => u.name.toLowerCase(),
          joinedAt: (u) => new Date(u.joinedAt).getTime(),
          lastActiveAt: (u) => new Date(u.lastActiveAt).getTime(),
          ordersCount: (u) => u.ordersCount,
          totalSpent: (u) => u.totalSpent,
        },
        "joinedAt"
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
        all: users.length,
        active: users.filter((u) => u.status === "active").length,
        suspended: users.filter((u) => u.status === "suspended").length,
        pending_verification: users.filter((u) => u.status === "pending_verification").length,
        deactivated: users.filter((u) => u.status === "deactivated").length,
      };
    },

    async update(id, patch) {
      await apiDelay();
      const idx = users.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error(`User ${id} not found`);
      users[idx] = { ...users[idx], ...patch };
      syncDetail(id);
      logActivity(
        id,
        `Profile updated by platform admin${patch.role ? ` \u00b7 role set to ${patch.role.replace(/_/g, " ")}` : ""}`
      );
      return users[idx];
    },

    async setStatus(id, status) {
      await apiDelay();
      const user = findOrThrow(id);
      users[users.indexOf(user)] = { ...user, status };
      syncDetail(id);
      logActivity(id, `Account ${STATUS_VERB[status]} by platform admin`);
      return users[users.indexOf(user)];
    },

    async resetAccountState(id) {
      await apiDelay();
      const user = findOrThrow(id);
      const idx = users.indexOf(user);
      const restored: ManagedUser = {
        ...user,
        status: "active",
        disputeCount: 0,
        reportsCount: 0,
        walletBalance: Math.max(user.walletBalance, 0),
      };
      users[idx] = restored;

      const detail = details.get(id);
      if (detail) {
        detail.reports = [];
        syncDetail(id);
        logActivity(
          id,
          "Account state reset \u00b7 open reports dismissed and moderation flags cleared"
        );
      }
      return restored;
    },

    async getActivity(id) {
      await apiDelay(120);
      return details.get(id)?.activity ?? [];
    },
  };
}

const STATUS_VERB: Record<ManagedUserStatus, string> = {
  active: "activated",
  suspended: "suspended",
  pending_verification: "moved to pending verification",
  deactivated: "deactivated",
};

/** Structured clone with Date-free plain objects only. */
function structuredCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
