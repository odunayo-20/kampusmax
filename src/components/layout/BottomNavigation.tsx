"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, GraduationCap, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/marketplace", icon: Store, label: "Market" },
  { href: "/community", icon: GraduationCap, label: "Community" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNavigation() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/home") return pathname === "/home";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 safe-bottom lg:hidden">
      <div className="max-w-lg mx-auto flex items-center justify-around h-[60px]">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-full relative",
                "transition-colors duration-200",
                active ? "text-primary-600" : "text-neutral-500"
              )}
            >
              <div className="relative">
                <tab.icon
                  className={cn(
                    "h-[22px] w-[22px] transition-all duration-200",
                    active && "stroke-[2.5px]"
                  )}
                />
                {active && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-[3px] w-4 bg-primary-600 rounded-full" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] transition-all duration-200",
                  active ? "font-semibold" : "font-medium"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
