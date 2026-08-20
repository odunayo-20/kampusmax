"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav, TopBar } from "@/components/layout";
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
      <TopBar />
      <main className="max-w-lg mx-auto pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
