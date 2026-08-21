"use client";

import Link from "next/link";
import { MapPin, Bell, ShoppingCart, Search } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { getUnreadNotificationCount } from "@/services/notifications";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

export function MobileHeader() {
  const { itemCount } = useCart();
  const { selectedCampus } = useApp();
  const { user } = useAuth();
  const unreadCount = user ? getUnreadNotificationCount(user.id) : 0;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-kampmax-border lg:hidden">
      <div className="max-w-lg mx-auto flex items-center justify-between h-12 px-4">
        <Link href="/home" className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-kampmax-navy tracking-tight">
            Kampmax
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          <Link
            href="/search"
            className={cn(
              "relative h-8 w-8 flex items-center justify-center rounded-lg",
              "hover:bg-kampmax-muted transition-colors"
            )}
          >
            <Search className="h-[18px] w-[18px] text-kampmax-text-secondary" />
          </Link>

          <div className="flex items-center gap-1 text-xs text-kampmax-text-secondary mr-1.5">
            <MapPin className="h-3.5 w-3.5 text-kampmax-blue" />
            <span className="font-medium">{selectedCampus.abbreviation}</span>
          </div>

          <Link
            href="/notifications"
            className={cn(
              "relative h-8 w-8 flex items-center justify-center rounded-lg",
              "hover:bg-kampmax-muted transition-colors"
            )}
          >
            <Bell className="h-[18px] w-[18px] text-kampmax-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-kampmax-error text-white text-[9px] font-bold rounded-full px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className={cn(
              "relative h-8 w-8 flex items-center justify-center rounded-lg",
              "hover:bg-kampmax-muted transition-colors"
            )}
          >
            <ShoppingCart className="h-[18px] w-[18px] text-kampmax-text-secondary" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-kampmax-blue text-white text-[9px] font-bold rounded-full px-1">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          <Link href="/profile" className="ml-0.5">
            <Avatar
              name={user?.name || "User"}
              size="sm"
              className="h-7 w-7 text-[10px]"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
