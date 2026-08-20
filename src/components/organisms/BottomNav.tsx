"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, GraduationCap, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/marketplace", icon: Store, label: "Market" },
  { href: "/campus", icon: GraduationCap, label: "Campus" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-kampmax-border z-50 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 h-full",
                "transition-colors duration-200",
                isActive ? "text-kampmax-blue" : "text-kampmax-text-secondary"
              )}
            >
              <tab.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
