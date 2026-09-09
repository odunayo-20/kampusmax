import {
  ListQuery,
  ManagedFreelancer,
  ManagedFreelancerDetail,
  Paginated,
  FreelancerActivityEvent,
  FreelancerBucket,
  FreelancerStatusCounts,
  ManagedFreelancersListQuery,
} from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";
import { buildFreelancerDataset, filterFreelancers, computeFreelancerCounts, type FreelancerDataset } from "@/data/admin/freelancer-management";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/freelancers)
// ------------------------------------------------------------

export type ManagedFreelancerSortField =
  | "displayName"
  | "joinedAt"
  | "servicesCount"
  | "totalBookings"
  | "rating";

export interface AdminFreelancerManagementService {
  list(query?: ManagedFreelancersListQuery): Promise<Paginated<ManagedFreelancer>>;
  getById(id: string): Promise<ManagedFreelancerDetail | null>;
  getCounts(): Promise<FreelancerStatusCounts>;
  getCategories(): Promise<string[]>;
  suspend(id: string): Promise<ManagedFreelancer>;
  activate(id: string): Promise<ManagedFreelancer>;
  deactivate(id: string): Promise<ManagedFreelancer>;
  feature(id: string): Promise<ManagedFreelancer>;
  unfeature(id: string): Promise<ManagedFreelancer>;
  getActivity(id: string): Promise<FreelancerActivityEvent[]>;
}

// ------------------------------------------------------------
// MOCK IMPLEMENTATION
// ------------------------------------------------------------

export function createFreelancerManagementService(
  seed?: FreelancerDataset
): AdminFreelancerManagementService {
  const dataset = seed ?? buildFreelancerDataset();
  const freelancers = dataset.freelancers.map((f) => ({ ...f }));
  const details = new Map<string, ManagedFreelancerDetail>();

  for (const [id, detail] of dataset.details) {
    details.set(id, { ...detail, freelancer: { ...detail.freelancer } });
  }

  // Ensure detail freelancer refs match list freelancers
  for (const fl of freelancers) {
    const d = details.get(fl.id);
    if (d) {
      d.freelancer = fl;
    }
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
        status = "all",
        categoryId,
      } = query;

      const filtered = filterFreelancers(freelancers, { search, status, categoryId, page, pageSize });

      const sorted = applySort(
        filtered.items,
        sortBy,
        sortDir,
        {
          joinedAt: (v) => new Date(v.joinedAt).getTime(),
          totalBookings: (v) => v.totalBookings,
          rating: (v) => v.rating,
          servicesCount: (v) => v.servicesCount,
          displayName: (v) => v.displayName,
        },
        "joinedAt"
      );

      return {
        ...filtered,
        items: sorted,
        pageSize,
      };
    },

    async getById(id) {
      await apiDelay(120);
      return details.get(id) ?? null;
    },

    async getCounts() {
      await apiDelay();
      return computeFreelancerCounts(freelancers);
    },

    async getCategories() {
      await apiDelay();
      const cats = new Set<string>();
      for (const f of freelancers) {
        for (const c of f.categories) cats.add(c);
      }
      return Array.from(cats).sort();
    },

    async suspend(id) {
      await apiDelay();
      const idx = freelancers.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error(`Freelancer ${id} not found`);
      const updated = { ...freelancers[idx], status: "suspended" as const };
      freelancers[idx] = updated;
      const d = details.get(id);
      if (d) {
        d.freelancer = updated;
        d.profile = { ...d.profile, status: "suspended" };
      }
      return updated;
    },

    async activate(id) {
      await apiDelay();
      const idx = freelancers.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error(`Freelancer ${id} not found`);
      const updated = { ...freelancers[idx], status: "approved" as const };
      freelancers[idx] = updated;
      const d = details.get(id);
      if (d) {
        d.freelancer = updated;
        d.profile = { ...d.profile, status: "approved" };
      }
      return updated;
    },

    async deactivate(id) {
      await apiDelay();
      const idx = freelancers.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error(`Freelancer ${id} not found`);
      const updated = { ...freelancers[idx], status: "rejected" as const };
      freelancers[idx] = updated;
      const d = details.get(id);
      if (d) {
        d.freelancer = updated;
        d.profile = { ...d.profile, status: "rejected" };
      }
      return updated;
    },

    async feature(id) {
      await apiDelay();
      const idx = freelancers.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error(`Freelancer ${id} not found`);
      const updated = { ...freelancers[idx], featured: true };
      freelancers[idx] = updated;
      const d = details.get(id);
      if (d) {
        d.freelancer = updated;
      }
      return updated;
    },

    async unfeature(id) {
      await apiDelay();
      const idx = freelancers.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error(`Freelancer ${id} not found`);
      const updated = { ...freelancers[idx], featured: false };
      freelancers[idx] = updated;
      const d = details.get(id);
      if (d) {
        d.freelancer = updated;
      }
      return updated;
    },

    async getActivity(id) {
      await apiDelay(150);
      const d = details.get(id);
      if (!d) return [];
      return d.activity;
    },
  };
}