"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopNavigation } from "@/components/layout/DesktopNavigation";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useAuth } from "@/lib/auth-context";
import { Footer } from "@/components/layout/footer/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAuth();

  // Vendor pages render their own full-screen shell (sidebar/header)
  const isVendorSection = pathname.startsWith("/vendor");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kampmax-bg">
        <div className="h-8 w-8 border-[3px] border-kampmax-blue/20 border-t-kampmax-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-kampmax-bg">
      {!isVendorSection && <MobileHeader />}
      {!isVendorSection && <DesktopNavigation />}
      <main className={isVendorSection ? "" : "pb-20 lg:pb-6"}>{children}</main>
      {!isVendorSection && <BottomNavigation />}
      {!isVendorSection && <Footer />}
      {!isVendorSection && <CartDrawer />}
    </div>
  );
}
