"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// ============================================================
// FINANCE CONSOLE TABS (Module 46)
//
// Overview / Reconciliation / Reports. The whole finance surface is
// read-only; tabs only change the derived surface shown, never the
// underlying stores.
// ============================================================

const TABS = [
  { href: "/admin/finance", label: "Overview" },
  { href: "/admin/finance/reconciliation", label: "Reconciliation" },
  { href: "/admin/finance/reports", label: "Reports" },
] as const;

export function FinanceTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Finance console"
      className="mb-4 inline-flex overflow-hidden rounded-md border border-kampmax-border bg-white text-xs"
    >
      {TABS.map((tab) => {
        const active =
          pathname === tab.href ||
          (tab.href !== "/admin/finance" &&
            pathname.startsWith(`${tab.href}`));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "h-9 px-4 font-medium transition-colors inline-flex items-center",
              active
                ? "bg-kampmax-navy text-white"
                : "text-kampmax-text-secondary hover:bg-kampmax-muted/60"
            )}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}