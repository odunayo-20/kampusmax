import {
  ListQuery,
  Paginated,
  PlatformUser,
  PlatformUserStatus,
} from "@/types/admin";
import {
  apiDelay,
  applySearch,
  applySort,
  paginate,
} from "@/lib/admin/api";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/users)
// ------------------------------------------------------------

export type UserSortField = "joinedAt" | "lastActiveAt" | "ordersCount" | "totalSpent" | "name";

export interface UserListFilters {
  status?: PlatformUserStatus | "all";
  kind?: PlatformUser["kind"] | "all";
  campusId?: string | "all";
}

export interface UserListQuery extends ListQuery, UserListFilters {}

export interface AdminUserService {
  list(query?: UserListQuery): Promise<Paginated<PlatformUser>>;
  getById(id: string): Promise<PlatformUser | null>;
  setStatus(id: string, status: PlatformUserStatus): Promise<PlatformUser>;
}

// ------------------------------------------------------------
// MOCK IMPLEMENTATION
// ------------------------------------------------------------

export function createMockUserService(seed: PlatformUser[]): AdminUserService {
  let users = seed.map((u) => ({ ...u }));

  return {
    async list(query = {}) {
      await apiDelay();
      const {
        search,
        sortBy,
        sortDir = "desc",
        page = 1,
        pageSize = 10,
        status = "all",
        kind = "all",
        campusId = "all",
      } = query;

      let rows = users.filter(
        (u) =>
          (status === "all" || u.status === status) &&
          (kind === "all" || u.kind === kind) &&
          (campusId === "all" || u.campusId === campusId)
      );

      rows = applySearch(rows, search, (u) => [u.name, u.email, u.phone, u.id]);

      rows = applySort(
        rows,
        sortBy,
        sortDir,
        {
          joinedAt: (u) => new Date(u.joinedAt).getTime(),
          lastActiveAt: (u) => new Date(u.lastActiveAt).getTime(),
          ordersCount: (u) => u.ordersCount,
          totalSpent: (u) => u.totalSpent,
          name: (u) => u.name,
        },
        "joinedAt"
      );

      return paginate(rows, { page, pageSize });
    },

    async getById(id) {
      await apiDelay(120);
      return users.find((u) => u.id === id) ?? null;
    },

    async setStatus(id, status) {
      await apiDelay();
      const idx = users.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error(`User ${id} not found`);
      users[idx] = { ...users[idx], status };
      return users[idx];
    },
  };
}
