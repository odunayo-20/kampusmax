"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Store, GraduationCap, MessageCircle,
  MapPin, Bell, ShoppingCart, ChevronDown
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { getUnreadNotificationCount } from "@/services/notifications";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/marketplace", icon: Store, label: "Market" },
  { href: "/community", icon: GraduationCap, label: "Community" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
];

export function DesktopNavigation() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { selectedCampus } = useApp();
  const { user } = useAuth();
  const unreadCount = user ? getUnreadNotificationCount(user.id) : 0;

  function isActive(href: string): boolean {
    if (href === "/home") return pathname === "/home";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="hidden lg:block sticky top-0 z-40 bg-white border-b border-kampmax-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-6">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/home" className="flex items-center gap-1.5 mr-4">
            <span className="text-xl font-bold text-kampmax-navy tracking-tight">
              Kampmax
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-kampmax-blue/10 text-kampmax-blue"
                      : "text-kampmax-text-secondary hover:text-kampmax-text hover:bg-kampmax-muted"
                  )}
                >
                  <link.icon className={cn("h-4 w-4", active && "stroke-[2.5px]")} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Campus + Actions + Profile */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-kampmax-text-secondary mr-2 px-2 py-1 rounded-md bg-kampmax-muted">
            <MapPin className="h-3.5 w-3.5 text-kampmax-blue" />
            <span className="font-medium text-kampmax-text">{selectedCampus.abbreviation}</span>
            <ChevronDown className="h-3 w-3 text-kampmax-text-secondary" />
          </div>

          <Link
            href="/notifications"
            className={cn(
              "relative h-9 w-9 flex items-center justify-center rounded-lg transition-colors",
              "hover:bg-kampmax-muted",
              isActive("/notifications") && "bg-kampmax-blue/10 text-kampmax-blue"
            )}
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-kampmax-error text-white text-[9px] font-bold rounded-full px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className={cn(
              "relative h-9 w-9 flex items-center justify-center rounded-lg transition-colors",
              "hover:bg-kampmax-muted",
              isActive("/cart") && "bg-kampmax-blue/10 text-kampmax-blue"
            )}
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-kampmax-blue text-white text-[9px] font-bold rounded-full px-1">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          <div className="w-px h-6 bg-kampmax-border mx-1" />

          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg transition-colors",
              "hover:bg-kampmax-muted",
              isActive("/profile") && "bg-kampmax-blue/10"
            )}
          >
            <Avatar
              name={user?.name || "User"}
              size="sm"
              className="h-8 w-8 text-xs"
            />
            <span className="text-sm font-medium text-kampmax-text max-w-[120px] truncate">
              {user?.name || "Profile"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
