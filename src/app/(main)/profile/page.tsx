"use client";

import { useRouter } from "next/navigation";
import {
  Settings, Package, MapPin, HelpCircle, LogOut,
  ChevronRight, Store, CreditCard, Star, Bell
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Avatar } from "@/components/atoms/Avatar";
import { getCurrentUser, getVendorByUserId } from "@/services/users";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const vendor = getVendorByUserId(currentUser.id);

  const menuItems = [
    { icon: Package, label: "My Orders", desc: "View order history", href: "/orders" },
    { icon: MapPin, label: "Saved Locations", desc: "Campus pickup points", href: "#" },
    { icon: Bell, label: "Notifications", desc: "Manage alerts", href: "/notifications" },
    { icon: CreditCard, label: "Payment Methods", desc: "Manage cards & accounts", href: "#" },
    { icon: Star, label: "Reviews", desc: "Your ratings & reviews", href: "#" },
    { icon: HelpCircle, label: "Help & Support", desc: "FAQ and contact us", href: "#" },
    { icon: Settings, label: "Settings", desc: "Account preferences", href: "#" },
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="bg-white rounded-lg border border-kampmax-border p-4">
        <div className="flex items-center gap-3">
          <Avatar name={currentUser.name} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold text-kampmax-text">
                {currentUser.name}
              </h1>
              {currentUser.isVerified && (
                <span className="text-[10px] bg-blue-50 text-kampmax-blue px-1.5 py-0.5 rounded font-medium">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-kampmax-text-secondary">
              {currentUser.department} · {currentUser.level}
            </p>
            <p className="text-xs text-kampmax-text-secondary mt-0.5">
              {currentUser.email}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={() => {}}
        >
          Edit Profile
        </Button>
      </div>

      {vendor && (
        <div
          className="bg-kampmax-navy rounded-lg p-4 cursor-pointer"
          onClick={() => router.push("/profile/vendor")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">
                {vendor.storeName}
              </h3>
              <p className="text-xs text-white/70">
                ⭐ {vendor.rating} · {vendor.totalSales} sales
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-white/70" />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-kampmax-border divide-y divide-kampmax-border">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-kampmax-muted transition-colors"
            onClick={() => {
              if (item.href !== "#") router.push(item.href);
            }}
          >
            <item.icon className="h-5 w-5 text-kampmax-text-secondary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-kampmax-text">{item.label}</p>
              <p className="text-xs text-kampmax-text-secondary">{item.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-kampmax-text-secondary" />
          </button>
        ))}
      </div>

      <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-kampmax-error hover:bg-red-50 rounded-lg transition-colors">
        <LogOut className="h-4 w-4" />
        Log Out
      </button>
    </div>
  );
}
