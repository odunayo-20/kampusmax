"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopNavigation } from "@/components/layout/DesktopNavigation";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useAuth } from "@/lib/auth-context";
import { Footer } from "@/components/layout/footer/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { isServiceProviderDashboardPath } from "@/lib/utils";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAuth();

  // Dashboard sections render their own full-screen shell (sidebar/header)
  const isVendorSection = pathname.startsWith("/vendor");
  const isServiceProviderSection = isServiceProviderDashboardPath(pathname);
  const isDashboardSection = isVendorSection || isServiceProviderSection;

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
      {!isDashboardSection && <MobileHeader />}
      {!isDashboardSection && <DesktopNavigation />}
      <main className={isDashboardSection ? "" : "pb-20 lg:pb-6"}>{children}</main>
      {!isDashboardSection && <BottomNavigation />}
      {!isDashboardSection && <Footer />}
      {!isDashboardSection && <CartDrawer />}
    </div>
  );
}
