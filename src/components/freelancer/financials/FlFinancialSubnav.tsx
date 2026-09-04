"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/freelancer/earnings", label: "Earnings", match: "earnings" },
  { href: "/freelancer/transactions", label: "Transactions", match: "transactions" },
  { href: "/freelancer/payouts", label: "Withdrawals", match: "payouts" },
  { href: "/freelancer/payout-methods", label: "Payout method", match: "payout-methods" },
] as const;

export function FlFinancialSubnav() {
  const pathname = usePathname();

  const active = (match: string): boolean => {
    if (match === "earnings") return pathname === "/freelancer/earnings";
    return pathname.startsWith(`/freelancer/${match}`);
  };

  return (
    <nav aria-label="Financials sections" className="flex gap-1 overflow-x-auto border-b border-kampmax-border pb-px">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active(item.match) ? "page" : undefined}
          className={cn(
            "whitespace-nowrap rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-colors",
            active(item.match)
              ? "border-primary-600 text-primary-700"
              : "border-transparent text-kampmax-text-secondary hover:text-kampmax-text"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
