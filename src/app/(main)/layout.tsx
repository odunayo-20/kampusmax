"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopNavigation } from "@/components/layout/DesktopNavigation";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useAuth } from "@/lib/auth-context";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kampmax-bg">
        <div className="h-8 w-8 border-3 border-kampmax-blue/20 border-t-kampmax-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-kampmax-bg">
      <MobileHeader />
      <DesktopNavigation />
      <main className="pb-20 lg:pb-6">{children}</main>
      <BottomNavigation />
    </div>
  );
}
