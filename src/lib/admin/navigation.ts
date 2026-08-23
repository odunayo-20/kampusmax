import { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  CreditCard,
  Flag,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Package,
  Scale,
  Settings,
  ShoppingBag,
  Star,
  Store,
  Tags,
  Users,
  Wallet,
  Landmark,
} from "lucide-react";
import { AdminNavItemKey, canSeeSection } from "./permissions";
import { AdminRole } from "@/types/admin";

export interface AdminNavItem {
  key: AdminNavItemKey;
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  id: string;
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { key: "dashboard", href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { key: "users", href: "/admin/users", label: "Users", icon: Users },
      { key: "vendors", href: "/admin/vendors", label: "Vendors", icon: Store },
      { key: "campuses", href: "/admin/campuses", label: "Campuses", icon: Building2 },
    ],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      { key: "products", href: "/admin/products", label: "Products", icon: Package },
      { key: "categories", href: "/admin/categories", label: "Categories", icon: Tags },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    items: [
      { key: "orders", href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { key: "payments", href: "/admin/payments", label: "Payments", icon: CreditCard },
      { key: "promotions", href: "/admin/promotions", label: "Promotions", icon: Megaphone },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { key: "wallet", href: "/admin/wallet", label: "Wallets", icon: Wallet },
      { key: "withdrawals", href: "/admin/withdrawals", label: "Withdrawals", icon: Landmark },
    ],
  },
  {
    id: "moderation",
    label: "Moderation",
    items: [
      { key: "campusFeed", href: "/admin/campus", label: "Campus Feed", icon: GraduationCap },
      { key: "reports", href: "/admin/reports", label: "Reports", icon: Flag },
      { key: "reviews", href: "/admin/reviews", label: "Reviews", icon: Star },
      { key: "disputes", href: "/admin/disputes", label: "Disputes", icon: Scale },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { key: "notifications", href: "/admin/notifications", label: "Notifications", icon: Bell },
      { key: "settings", href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

/** Flat list of nav items visible to a role. */
export function getNavForRole(role: AdminRole): AdminNavGroup[] {
  return ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canSeeSection(role, item.key)),
  })).filter((group) => group.items.length > 0);
}

// ------------------------------------------------------------
// BREADCRUMBS
// ------------------------------------------------------------

const LABELS: Record<string, string> = Object.fromEntries([
  ...ADMIN_NAV_GROUPS.flatMap((g) =>
    g.items.map((i) => [i.href.replace("/admin", "") || "/", i.label] as const)
  ),
]);

export function breadcrumbLabel(segment: string, index: number): string {
  if (index === 0) return "Admin";
  if (index === 1) {
    return LABELS[`/${segment}`] ?? titleCase(segment);
  }
  // Detail routes (/orders/KMP-2437 etc.)
  return segment.includes("-") ? segment.toUpperCase() : titleCase(segment);
}

export function isDetailSegment(segment: string): boolean {
  return /^(KMP-|usr-|vnd-|prd-|dsp-|rpt-|rev-|pst-|wdr-)/i.test(segment);
}

function titleCase(value: string): string {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
