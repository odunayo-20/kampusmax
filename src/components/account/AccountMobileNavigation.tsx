"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ACCOUNT_NAV_GROUPS, ACCOUNT_PROFILES_ITEM } from "@/lib/accountNav";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/account") return pathname === "/account";
  return pathname === href;
}

/** Mobile account navigation rendered as a slide-down sheet. */
export function AccountMobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="account-mobile-nav"
        aria-label="Toggle account navigation"
        className="inline-flex items-center gap-1.5 bg-white border border-kampmax-border rounded-lg px-3 py-2 text-sm font-medium text-kampmax-text"
      >
        {open ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )}
        Account menu
      </button>

      {open && (
        <div
          id="account-mobile-nav"
          className="mt-3 bg-white border border-kampmax-border rounded-xl p-2"
        >
          <nav aria-label="Account" className="space-y-3">
            {ACCOUNT_NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-kampmax-text-muted">
                  {group.title}
                </h3>
                <div className="grid grid-cols-2 gap-1">
                  {group.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={close}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium",
                          active
                            ? "bg-kampmax-blue/10 text-kampmax-blue"
                            : "text-kampmax-text-secondary hover:bg-kampmax-muted"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div>
              <h3 className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-kampmax-text-muted">
                Profiles
              </h3>
              <Link
                href={ACCOUNT_PROFILES_ITEM.href}
                onClick={close}
                aria-current={
                  isActive(pathname, ACCOUNT_PROFILES_ITEM.href)
                    ? "page"
                    : undefined
                }
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium",
                  isActive(pathname, ACCOUNT_PROFILES_ITEM.href)
                    ? "bg-kampmax-blue/10 text-kampmax-blue"
                    : "text-kampmax-text-secondary hover:bg-kampmax-muted"
                )}
              >
                <ACCOUNT_PROFILES_ITEM.icon className="h-4 w-4 shrink-0" />
                {ACCOUNT_PROFILES_ITEM.label}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
