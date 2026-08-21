import {
  SearchResultItem,
  SearchSuggestion,
  SearchResults,
  SearchFilters,
  SearchFilterType,
  TrendingSearch,
} from "@/types";
import { products } from "@/data/products";
import { users } from "@/data/users";
import { categories } from "@/data/categories";
import { campusPosts } from "@/data/posts";
import { events } from "@/data/events";

const RECENT_KEY = "kampmax_recent_searches";
const MAX_RECENT = 10;

// ── Helpers ──────────────────────────────────────────────

function matchesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

function scoreMatch(text: string, query: string): number {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  if (lower === q) return 100;
  if (lower.startsWith(q)) return 80;
  if (lower.split(" ").some((w) => w.startsWith(q))) return 60;
  if (lower.includes(q)) return 40;
  return 0;
}

// ── Trending ─────────────────────────────────────────────

const trendingSearches: TrendingSearch[] = [
  { query: "laptop", count: 234, category: "Electronics" },
  { query: "textbook", count: 189, category: "Books" },
  { query: "sneakers", count: 156, category: "Fashion" },
  { query: "calculator", count: 143, category: "Electronics" },
  { query: "jollof rice", count: 128, category: "Food" },
  { query: "ankara", count: 98, category: "Fashion" },
  { query: "power bank", count: 87, category: "Electronics" },
  { query: "headphones", count: 76, category: "Electronics" },
  { query: "food", count: 65, category: "Food" },
  { query: "notes", count: 54, category: "Books" },
];

export function getTrendingSearches(): TrendingSearch[] {
  return trendingSearches;
}

// ── Recent Searches ──────────────────────────────────────

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  if (typeof window === "undefined") return;
  const trimmed = query.trim();
  if (!trimmed) return;
  try {
    const recent = getRecentSearches().filter((r) => r !== trimmed);
    recent.unshift(trimmed);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // localStorage unavailable
  }
}

export function removeRecentSearch(query: string): void {
  if (typeof window === "undefined") return;
  try {
    const recent = getRecentSearches().filter((r) => r !== query);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {
    // localStorage unavailable
  }
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    // localStorage unavailable
  }
}

// ── Suggestions ──────────────────────────────────────────

export function getSuggestions(query: string): SearchSuggestion[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  const suggestions: SearchSuggestion[] = [];
  const seen = new Set<string>();

  // Category matches
  for (const cat of categories) {
    if (matchesQuery(cat.name, q) && !seen.has(cat.name)) {
      seen.add(cat.name);
      suggestions.push({
        text: cat.name,
        type: "entity",
        entityType: "category",
        entityId: cat.id,
      });
    }
  }

  // Product title matches
  for (const p of products) {
    if (matchesQuery(p.title, q) && !seen.has(p.title)) {
      seen.add(p.title);
      suggestions.push({
        text: p.title,
        type: "entity",
        entityType: "product",
        entityId: p.id,
      });
    }
  }

  // Vendor matches
  for (const u of users) {
    if (u.role === "vendor") {
      const vendor = users.find((v) => v.id === u.id);
      if (vendor && matchesQuery(vendor.name, q) && !seen.has(vendor.name)) {
        seen.add(vendor.name);
        suggestions.push({
          text: vendor.name,
          type: "entity",
          entityType: "vendor",
          entityId: vendor.id,
        });
      }
    }
  }

  // Tag matches
  for (const p of products) {
    if (p.tags) {
      for (const tag of p.tags) {
        if (matchesQuery(tag, q) && !seen.has(tag)) {
          seen.add(tag);
          suggestions.push({ text: tag, type: "query" });
        }
      }
    }
  }

  return suggestions.slice(0, 8);
}

// ── Search ───────────────────────────────────────────────

export function search(query: string, filters?: SearchFilters): SearchResults {
  const q = (query || "").trim();
  const typeFilter = filters?.type || "all";
  const results: SearchResultItem[] = [];

  if (!q) {
    return { query: q, results: [], totalCount: 0, suggestions: [] };
  }

  // Search products
  if (typeFilter === "all" || typeFilter === "product") {
    for (const p of products) {
      const score = scoreMatch(p.title, q)
        + scoreMatch(p.description, q)
        + (p.tags?.reduce((s, t) => s + scoreMatch(t, q), 0) || 0);
      if (score > 0) {
        results.push({
          id: p.id,
          type: "product",
          title: p.title,
          subtitle: `${p.condition} · ${p.location || "RUGIPO"}`,
          description: p.description.slice(0, 100),
          image: p.images[0],
          url: `/marketplace/${p.id}`,
          rating: p.rating,
          price: p.price,
          campusId: p.campusId,
          tags: p.tags,
        });
      }
    }
  }

  // Search vendors (via users with vendor role)
  if (typeFilter === "all" || typeFilter === "vendor") {
    const { vendors: vendorData } = require("@/data/users");
    for (const v of vendorData) {
      const score = scoreMatch(v.storeName, q) + scoreMatch(v.description, q);
      if (score > 0) {
        const owner = users.find((u) => u.id === v.userId);
        results.push({
          id: v.id,
          type: "vendor",
          title: v.storeName,
          subtitle: v.specialties.join(", "),
          description: v.description.slice(0, 100),
          image: owner?.avatar,
          url: `/marketplace?vendor=${v.id}`,
          rating: v.rating,
          campusId: v.campusId,
        });
      }
    }
  }

  // Search categories
  if (typeFilter === "all" || typeFilter === "category") {
    for (const c of categories) {
      const score = scoreMatch(c.name, q);
      if (score > 0) {
        results.push({
          id: c.id,
          type: "category",
          title: c.name,
          subtitle: `${c.productCount} products`,
          url: `/marketplace?category=${c.id}`,
        });
      }
    }
  }

  // Search campus posts
  if (typeFilter === "all" || typeFilter === "post") {
    for (const post of campusPosts) {
      const score = scoreMatch(post.title, q) + scoreMatch(post.content, q);
      if (score > 0) {
        const author = users.find((u) => u.id === post.userId);
        results.push({
          id: post.id,
          type: "post",
          title: post.title,
          subtitle: `${post.type} · by ${author?.name || "Unknown"}`,
          description: post.content.slice(0, 100),
          image: post.images?.[0],
          url: `/community/${post.id}`,
          tags: post.tags,
        });
      }
    }
  }

  // Search events
  if (typeFilter === "all" || typeFilter === "event") {
    for (const event of events) {
      const score = scoreMatch(event.title, q) + scoreMatch(event.description, q);
      if (score > 0) {
        results.push({
          id: event.id,
          type: "event",
          title: event.title,
          subtitle: `${event.location} · ${new Date(event.startDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}`,
          description: event.description.slice(0, 100),
          image: event.imageUrl,
          url: `/community/${event.id}`,
          tags: event.tags,
        });
      }
    }
  }

  // Sort by score relevance
  results.sort((a, b) => {
    const scoreA = scoreMatch(a.title, q) + scoreMatch(a.subtitle, q);
    const scoreB = scoreMatch(b.title, q) + scoreMatch(b.subtitle, q);
    return scoreB - scoreA;
  });

  // Apply price filter
  let filtered = results;
  if (filters?.minPrice !== undefined) {
    filtered = filtered.filter((r) => !r.price || r.price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    filtered = filtered.filter((r) => !r.price || r.price <= filters.maxPrice!);
  }
  if (filters?.campusId) {
    filtered = filtered.filter((r) => !r.campusId || r.campusId === filters.campusId);
  }

  // Sort
  if (filters?.sortBy === "recent") {
    filtered.sort((a, b) => (b.id > a.id ? 1 : -1));
  } else if (filters?.sortBy === "popular") {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (filters?.sortBy === "price_low") {
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (filters?.sortBy === "price_high") {
    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  }

  const suggestions = getSuggestions(q);

  return {
    query: q,
    results: filtered,
    totalCount: filtered.length,
    suggestions,
  };
}
