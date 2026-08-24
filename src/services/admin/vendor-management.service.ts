import {
  ListQuery,
  ManagedVendor,
  ManagedVendorDetail,
  Paginated,
  VendorActivityEvent,
  VendorBucket,
  VendorStatusCounts,
  VendorVerificationDocument,
  VendorVerificationStatus,
} from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";
import {
  bucketOf,
  buildManagedVendorDataset,
  type ManagedVendorDataset,
} from "@/data/admin/vendor-management";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/vendors)
// ------------------------------------------------------------

export type ManagedVendorSortField =
  | "storeName"
  | "registeredAt"
  | "productsCount"
  | "ordersCount"
  | "totalSales"
  | "rating";

export interface ManagedVendorListFilters {
  queue?: VendorBucket | "all";
  campusId?: string | "all";
  category?: string | "all";
}

export interface ManagedVendorListQuery extends ListQuery, ManagedVendorListFilters {}

export interface AdminVendorManagementService {
  list(query?: ManagedVendorListQuery): Promise<Paginated<ManagedVendor>>;
  getById(id: string): Promise<ManagedVendorDetail | null>;
  getCounts(): Promise<VendorStatusCounts>;
  getCategories(): Promise<string[]>;
  approve(id: string): Promise<ManagedVendor>;
  reject(id: string, reason: string): Promise<ManagedVendor>;
  suspend(id: string): Promise<ManagedVendor>;
  activate(id: string): Promise<ManagedVendor>;
  deactivate(id: string): Promise<ManagedVendor>;
  getActivity(id: string): Promise<VendorActivityEvent[]>;
}

// ------------------------------------------------------------
// MOCK IMPLEMENTATION
// ------------------------------------------------------------

export function createVendorManagementService(
  seed?: ManagedVendorDataset
): AdminVendorManagementService {
  const dataset = seed ?? buildManagedVendorDataset();
  const vendors = dataset.vendors.map((v) => ({ ...v }));
  const details = new Map<string, ManagedVendorDetail>();
  // Deep-copy details so module-level mock data stays pristine.
  dataset.details.forEach((detail, id) =>
    details.set(id, structuredCopy(detail))
  );

  function findOrThrow(id: string): ManagedVendor {
    const vendor = vendors.find((v) => v.id === id);
    if (!vendor) throw new Error(`Vendor ${id} not found`);
    return vendor;
  }

  function replace(updated: ManagedVendor): void {
    const idx = vendors.findIndex((v) => v.id === updated.id);
    if (idx === -1) throw new Error(`Vendor ${updated.id} not found`);
    vendors[idx] = updated;
    syncDetail(updated.id);
  }

  function syncDetail(id: string): void {
    const detail = details.get(id);
    const vendor = vendors.find((v) => v.id === id);
    if (detail && vendor) detail.vendor = structuredCopy(vendor);
  }

  function logActivity(vendorId: string, message: string, meta = "Admin console"): void {
    const detail = details.get(vendorId);
    if (!detail) return;
    detail.activity.unshift({
      id: `vact-${vendorId}-admin-${detail.activity.length + 1}`,
      kind: "admin",
      message,
      meta,
      at: new Date().toISOString(),
    });
  }

  function setVerification(
    id: string,
    status: VendorVerificationStatus,
    reviewer: string,
    reason?: string
  ): ManagedVendor {
    const vendor = findOrThrow(id);
    const documents: VendorVerificationDocument[] =
      status === "verified"
        ? vendor.verification.documents.map((d) => ({
            ...d,
            state:
              d.state === "missing" || d.state === "rejected"
                ? "approved"
                : d.state,
          }))
        : vendor.verification.documents;

    const updated: ManagedVendor = {
      ...vendor,
      verificationStatus: status,
      storeStatus:
        status === "verified"
          ? "active"
          : status === "rejected"
            ? "deactivated"
            : vendor.storeStatus,
      verification: {
        ...vendor.verification,
        bvnVerified: status === "verified",
        documents,
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewer,
        rejectionReason: status === "rejected" ? reason ?? null : null,
      },
      ordersCount:
        status === "verified" && vendor.ordersCount === 0
          ? 12
          : vendor.ordersCount,
    };
    replace(updated);
    logActivity(
      id,
      status === "verified"
        ? `Verification approved by ${reviewer} · storefront is live`
        : `Verification rejected by ${reviewer}${reason ? ` · ${reason}` : ""}`,
      "Verification"
    );
    return updated;
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
        queue = "all",
        campusId = "all",
        category = "all",
      } = query;

      let rows = vendors.filter(
        (v) =>
          (queue === "all" || bucketOf(v.verificationStatus, v.storeStatus) === queue) &&
          (campusId === "all" || v.campusId === campusId) &&
          (category === "all" || v.category === category)
      );

      rows = applySearch(rows, search, (v) => [
        v.storeName,
        v.owner.name,
        v.owner.email,
        v.category,
        v.id,
      ]);

      rows = applySort(
        rows,
        sortBy,
        sortDir,
        {
          storeName: (v) => v.storeName.toLowerCase(),
          registeredAt: (v) => new Date(v.registeredAt).getTime(),
          productsCount: (v) => v.productsCount,
          ordersCount: (v) => v.ordersCount,
          totalSales: (v) => v.totalSales,
          rating: (v) => v.rating,
        },
        "registeredAt"
      );

      return paginate(rows, { page, pageSize });
    },

    async getById(id) {
      await apiDelay(160);
      return details.get(id) ?? null;
    },

    async getCounts() {
      await apiDelay(80);
      const by = (bucket: VendorBucket) =>
        vendors.filter(
          (v) => bucketOf(v.verificationStatus, v.storeStatus) === bucket
        ).length;
      return {
        all: vendors.length,
        pending_verification: by("pending_verification"),
        verified: by("verified"),
        rejected: by("rejected"),
        suspended: by("suspended"),
        deactivated: by("deactivated"),
      };
    },

    async getCategories() {
      await apiDelay(60);
      return [...new Set(vendors.map((v) => v.category))].sort();
    },

    async approve(id) {
      await apiDelay();
      return setVerification(id, "verified", "Platform Admin");
    },

    async reject(id, reason) {
      await apiDelay();
      if (!reason.trim()) throw new Error("A rejection reason is required.");
      return setVerification(id, "rejected", "Platform Admin", reason.trim());
    },

    async suspend(id) {
      await apiDelay();
      const vendor = findOrThrow(id);
      if (vendor.verificationStatus !== "verified") {
        throw new Error("Only verified stores can be suspended.");
      }
      if (vendor.storeStatus !== "active") {
        throw new Error(`Store is already ${vendor.storeStatus}.`);
      }
      const updated: ManagedVendor = { ...vendor, storeStatus: "suspended" };
      replace(updated);
      logActivity(id, "Store suspended · listings hidden from buyers");
      return updated;
    },

    async activate(id) {
      await apiDelay();
      const vendor = findOrThrow(id);
      if (vendor.verificationStatus !== "verified") {
        throw new Error("Verify the vendor before activating the store.");
      }
      if (vendor.storeStatus === "active") {
        throw new Error("Store is already active.");
      }
      const updated: ManagedVendor = { ...vendor, storeStatus: "active" };
      replace(updated);
      logActivity(id, "Store re-activated · trading resumed");
      return updated;
    },

    async deactivate(id) {
      await apiDelay();
      const vendor = findOrThrow(id);
      if (vendor.verificationStatus !== "verified") {
        throw new Error("Unverified vendors are managed through the verification queue.");
      }
      if (vendor.storeStatus === "deactivated") {
        throw new Error("Store is already deactivated.");
      }
      const updated: ManagedVendor = { ...vendor, storeStatus: "deactivated" };
      replace(updated);
      logActivity(id, "Store deactivated by platform admin");
      return updated;
    },

    async getActivity(id) {
      await apiDelay(120);
      return details.get(id)?.activity ?? [];
    },
  };
}

/** Structured clone with Date-free plain objects only. */
function structuredCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
