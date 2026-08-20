"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard, Package, Plus, ShoppingCart, Users, DollarSign,
  Wallet, Store, Settings, ArrowLeft, Menu, X, AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { getVendorByUserId } from "@/services/users";

const navItems = [
  { href: "/vendor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/products", label: "Products", icon: Package },
  { href: "/vendor/products/new", label: "Add Product", icon: Plus },
  { href: "/vendor/orders", label: "Orders", icon: ShoppingCart },
  { href: "/vendor/customers", label: "Customers", icon: Users },
  { href: "/vendor/earnings", label: "Earnings", icon: DollarSign },
  { href: "/vendor/wallet", label: "Wallet", icon: Wallet },
  { href: "/vendor/store", label: "Store Profile", icon: Store },
  { href: "/vendor/store/settings", label: "Store Settings", icon: Settings },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status } = useAuth();
  const vendor = user ? getVendorByUserId(user.id) : null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/vendor") return pathname === "/vendor";
    return pathname.startsWith(href);
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kampmax-bg">
        <div className="h-8 w-8 border-3 border-kampmax-blue/20 border-t-kampmax-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-kampmax-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-kampmax-border p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-kampmax-gold/10 flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-kampmax-gold" />
          </div>
          <h2 className="text-lg font-bold text-kampmax-text mb-2">Become a Vendor</h2>
          <p className="text-sm text-kampmax-text-secondary mb-6">
            You need a vendor account to access the seller dashboard. Switch your account type to start selling on Kampmax.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                // Simulate becoming a vendor — force vendor lookup for this user
                // In real app this would be an API call
                window.location.href = "/profile";
              }}
              className="w-full py-3 rounded-xl bg-kampmax-blue text-white text-sm font-semibold"
            >
              Go to Profile
            </button>
            <button
              onClick={() => router.push("/home")}
              className="w-full py-3 rounded-xl border border-kampmax-border text-kampmax-text text-sm font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kampmax-bg">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-kampmax-navy px-6 pb-4 pt-6">
          <button onClick={() => router.push("/home")} className="flex items-center gap-2 text-white/60 hover:text-white text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Kampmax
          </button>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-kampmax-gold" />
            <span className="text-sm font-bold text-white">
              {vendor.storeName}
            </span>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-kampmax-navy px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push("/home")} className="text-white/60 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-kampmax-gold" />
          <span className="text-sm font-bold text-white">
            {vendor.storeName}
          </span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-kampmax-navy/95 pt-14">
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="px-4 py-4 lg:px-8 lg:py-6 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
