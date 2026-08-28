"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, LogIn, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/atoms/Button";

/**
 * Lightweight public header shown on public storefront pages. Links the brand
 * back to the marketplace landing and offers auth-aware actions (Log in vs
 * My account). Never requires authentication to browse.
 */
export function StorePublicHeader() {
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.push(`/login?returnTo=${encodeURIComponent(pathname || "/")}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-kampmax-border">
      <div className="max-w-[1280px] mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
          aria-label="Kampmax home"
        >
          <span className="w-8 h-8 rounded-lg bg-kampmax-navy flex items-center justify-center text-white">
            <Package className="h-4 w-4" />
          </span>
          <span className="text-lg font-bold text-kampmax-navy hidden sm:inline">
            Kampmax
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {status === "authenticated" && user ? (
            <>
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-kampmax-text hover:text-kampmax-blue"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">My account</span>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <Link
              href="/login?returnTo=/marketplace"
              className="inline-flex items-center gap-1.5 rounded-md bg-kampmax-navy text-white px-4 py-2 text-sm font-semibold hover:bg-kampmax-navy-light"
            >
              <LogIn className="h-4 w-4" />
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
