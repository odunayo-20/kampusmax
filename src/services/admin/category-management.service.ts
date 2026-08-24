import { apiDelay, applySearch, paginate } from "@/lib/admin/api";
import { buildCategoryManagementDataset } from "@/data/admin/category-management";
import type {
  CategoryInput,
  CategoryListQuery,
  CategoryParentOption,
  CategoryReorderDirection,
  CategorySortField,
  CategoryStatusCounts,
  ManagedCategory,
  ManagedCategoryStatus,
  Paginated,
  SortDir,
} from "@/types/admin";

export interface AdminCategoryManagementService {
  list(query?: CategoryListQuery): Promise<Paginated<ManagedCategory>>;
  getCounts(): Promise<CategoryStatusCounts>;
  getParentOptions(): Promise<CategoryParentOption[]>;
  create(input: CategoryInput): Promise<ManagedCategory>;
  update(id: string, patch: Partial<CategoryInput>): Promise<ManagedCategory>;
  setStatus(id: string, status: ManagedCategoryStatus): Promise<void>;
  reorder(id: string, direction: CategoryReorderDirection): Promise<void>;
  remove(id: string): Promise<void>;
}

function structuredCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
}

const PAGE_SIZE = 20;

export function createCategoryManagementService(
  seed?: ManagedCategory[]
): AdminCategoryManagementService {
  let rows: ManagedCategory[] = seed ? structuredCopy(seed) : buildCategoryManagementDataset();
  let nextId = rows.length + 1;

  function clone(): ManagedCategory[] {
    return structuredCopy(rows);
  }

  /** Recompute derived hierarchy fields after any structural change. */
  function reindex(): void {
    const byId = new Map(rows.map((r) => [r.id, r]));
    for (const row of rows) {
      row.parentName = null;
      row.subcategoryCount = 0;
      row.totalProductCount = row.productCount;
    }
    for (const row of rows) {
      if (!row.parentId) continue;
      const parent = byId.get(row.parentId);
      if (!parent || parent.id === row.id) continue;
      row.parentName = parent.name;
      parent.subcategoryCount += 1;
      parent.totalProductCount += row.productCount;
    }
    // Renumber siblings in array order (array is the display order).
    const seen = new Map<string, number>();
    for (const row of rows) {
      const key = row.parentId ?? "root";
      const n = (seen.get(key) ?? 0) + 1;
      seen.set(key, n);
      row.sortOrder = n;
    }
  }

  function descendantsOf(id: string): Set<string> {
    const result = new Set<string>();
    let frontier = [id];
    while (frontier.length > 0) {
      const next: string[] = [];
      for (const row of rows) {
        if (row.parentId && frontier.includes(row.parentId) && !result.has(row.id)) {
          result.add(row.id);
          next.push(row.id);
        }
      }
      frontier = next;
    }
    return result;
  }

  function requireRow(id: string): ManagedCategory {
    const row = rows.find((r) => r.id === id);
    if (!row) throw new Error("Category not found. It may have been deleted.");
    return row;
  }

  return {
    async list(query = {}) {
      await apiDelay();

      // Canonical order: family blocks (parent followed by its children),
      // top-level families ordered by sortOrder, children by sibling order.
      let out = clone().sort((a, b) => {
        const aDepth = a.parentId ? 1 : 0;
        const bDepth = b.parentId ? 1 : 0;
        if (aDepth !== bDepth) return aDepth - bDepth;
        return a.sortOrder - b.sortOrder;
      });

      if (query.status && query.status !== "all") {
        out = out.filter((r) => r.status === query.status);
      }

      out = applySearch(out, query.search, (r) => [
        r.name,
        r.slug,
        r.description,
        r.parentName,
      ]);

      const sortBy: CategorySortField = query.sortBy ?? "sortOrder";
      const sortDir: SortDir = query.sortDir ?? "asc";
      if (sortBy === "name" || sortBy === "productCount") {
        const dirFactor = sortDir === "desc" ? -1 : 1;
        const topLevel = out.filter((r) => !r.parentId).sort((a, b) => {
          if (sortBy === "name") {
            return a.name.localeCompare(b.name) * dirFactor;
          }
          return (a.totalProductCount - b.totalProductCount) * dirFactor;
        });
        const families = new Map(
          topLevel.map((parent) => [
            parent.id,
            out.filter((r) => r.parentId === parent.id),
          ])
        );
        out = topLevel.flatMap((parent) => [
          parent,
          ...(families.get(parent.id) ?? []),
        ]);
      } else if (sortDir === "desc") {
        // Reverse whole family blocks so the tree still reads parent-first.
        const families: ManagedCategory[][] = [];
        for (const row of out) {
          if (!row.parentId) families.push([row]);
          else families[families.length - 1]?.push(row);
        }
        out = families.reverse().flat();
      }

      return paginate(out, query, PAGE_SIZE);
    },

    async getCounts() {
      await apiDelay();
      const active = rows.filter((r) => r.status === "active").length;
      return {
        total: rows.length,
        active,
        inactive: rows.length - active,
        productsCovered: rows.reduce((sum, r) => sum + r.totalProductCount, 0),
      };
    },

    async getParentOptions() {
      await apiDelay();
      return rows
        .filter((r) => !r.parentId)
        .map((r) => ({ id: r.id, name: r.name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    async create(input) {
      await apiDelay();
      const name = input.name.trim();
      if (name.length < 2) throw new Error("Category name must be at least 2 characters.");
      if (
        rows.some((r) => r.name.toLowerCase() === name.toLowerCase())
      ) {
        throw new Error(`A category named “${name}” already exists.`);
      }

      let parentId: string | null = null;
      if (input.parentId) {
        parentId = requireRow(input.parentId).id; // validates existence
      }

      const slugBase = slugify(name);
      let slug = slugBase;
      let n = 2;
      while (rows.some((r) => r.slug === slug)) slug = `${slugBase}-${n++}`;

      const now = new Date().toISOString();
      const row: ManagedCategory = {
        id: `cat-mgmt-${String(nextId++).padStart(3, "0")}`,
        name,
        slug,
        description: input.description.trim(),
        icon: input.icon || "package",
        parentId,
        parentName: null,
        productCount: 0,
        activeListings: 0,
        subcategoryCount: 0,
        totalProductCount: 0,
        sortOrder: Number.MAX_SAFE_INTEGER,
        status: "active",
        createdAt: now,
        updatedAt: now,
      };
      rows.push(row);
      reindex();
      return structuredCopy(row);
    },

    async update(id, patch) {
      await apiDelay();
      const row = requireRow(id);

      if (patch.name !== undefined) {
        const name = patch.name.trim();
        if (name.length < 2) throw new Error("Category name must be at least 2 characters.");
        if (
          rows.some(
            (r) => r.id !== id && r.name.toLowerCase() === name.toLowerCase()
          )
        ) {
          throw new Error(`A category named “${name}” already exists.`);
        }
        row.name = name;
        row.slug = slugify(name);
      }
      if (patch.description !== undefined) {
        row.description = patch.description.trim();
      }
      if (patch.icon !== undefined && patch.icon.trim()) {
        row.icon = patch.icon.trim();
      }
      if (patch.parentId !== undefined) {
        if (patch.parentId === id) {
          throw new Error("A category cannot be its own parent.");
        }
        if (patch.parentId && descendantsOf(id).has(patch.parentId)) {
          throw new Error("Move the subcategories out first - this parent contains them.");
        }
        row.parentId = patch.parentId || null;
      }

      row.updatedAt = new Date().toISOString();
      reindex();
      return structuredCopy(row);
    },

    async setStatus(id, status) {
      await apiDelay();
      const row = requireRow(id);
      row.status = status;
      row.updatedAt = new Date().toISOString();
    },

    async reorder(id, direction) {
      await apiDelay();
      const row = requireRow(id);
      const siblings = rows.filter((r) => (r.parentId ?? null) === (row.parentId ?? null));
      const index = siblings.findIndex((r) => r.id === id);
      const swapWith = direction === "up" ? siblings[index - 1] : siblings[index + 1];
      if (!swapWith) {
        throw new Error(
          direction === "up"
            ? `“${row.name}” is already first in its group.`
            : `“${row.name}” is already last in its group.`
        );
      }
      const i = rows.indexOf(row);
      const j = rows.indexOf(swapWith);
      rows[i] = swapWith;
      rows[j] = row;
      reindex();
    },

    async remove(id) {
      await apiDelay();
      const row = requireRow(id);

      if (row.subcategoryCount > 0) {
        throw new Error(
          `Delete or move ${row.subcategoryCount} sub${row.subcategoryCount === 1 ? "category" : "categories"} of “${row.name}” first.`
        );
      }
      if (row.productCount > 0) {
        throw new Error(
          `${row.productCount.toLocaleString("en-NG")} product${row.productCount === 1 ? " is" : "s are"} still assigned to “${row.name}”. Reassign them before deleting.`
        );
      }

      rows = rows.filter((r) => r.id !== id);
      reindex();
    },
  };
}
