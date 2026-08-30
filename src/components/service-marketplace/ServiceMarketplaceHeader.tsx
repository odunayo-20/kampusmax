"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wrench, LogIn, User, Home } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/atoms/Button";

/**
 * Public header for the customer-facing service marketplace. Guests can browse
 * everything — authentication is only required for actions (favorite, book,
 * request quote, report). The brand deep-links back to /services.
 */
export function ServiceMarketplaceHeader() {
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.push(`/login?returnTo=${encodeURIComponent(pathname || "/services")}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-kampmax-border">
      <div className="max-w-[1280px] mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 min-w-0">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
            aria-label="Kampmax services"
          >
            <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
              <Wrench className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold text-kampmax-navy hidden sm:inline">
              Kampmax Services
            </span>
          </Link>
          <Link
            href="/home"
            className="inline-flex items-center gap-1.5 ml-3 px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {status === "authenticated" && user ? (
            <>
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-kampmax-text hover:text-primary-600"
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
              href="/login?returnTo=/services"
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