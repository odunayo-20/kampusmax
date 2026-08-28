"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACCOUNT_NAV_GROUPS, ACCOUNT_PROFILES_ITEM } from "@/lib/accountNav";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/account") return pathname === "/account";
  return pathname === href;
}

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="space-y-6">
      {ACCOUNT_NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <h3 className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wide text-kampmax-text-secondary">
            {group.title}
          </h3>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-kampmax-blue/10 text-kampmax-blue"
                        : "text-kampmax-text-secondary hover:bg-kampmax-muted hover:text-kampmax-text"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* My Kampmax Profiles — clearly separated */}
      <div>
        <h3 className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wide text-kampmax-text-secondary">
          Profiles
        </h3>
        <Link
          href={ACCOUNT_PROFILES_ITEM.href}
          aria-current={
            isActive(pathname, ACCOUNT_PROFILES_ITEM.href) ? "page" : undefined
          }
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            isActive(pathname, ACCOUNT_PROFILES_ITEM.href)
              ? "bg-kampmax-blue/10 text-kampmax-blue"
              : "text-kampmax-text-secondary hover:bg-kampmax-muted hover:text-kampmax-text"
          )}
        >
          <ACCOUNT_PROFILES_ITEM.icon className="h-4.5 w-4.5 shrink-0" />
          {ACCOUNT_PROFILES_ITEM.label}
        </Link>
      </div>
    </nav>
  );
}
