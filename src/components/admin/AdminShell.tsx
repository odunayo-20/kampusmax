"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAdminUI } from "@/lib/admin/admin-ui-context";
import { AdminSidebar, AdminMobileSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

/**
 * Client shell for every /admin route: fixed collapsible sidebar on
 * desktop, drawer + compact header on mobile. Rendered from the
 * server layout so pages stay simple.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const { collapsed } = useAdminUI();

  return (
    <div className="min-h-screen bg-kampmax-bg">
      <AdminSidebar />
      <AdminMobileSidebar />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-150",
          collapsed ? "lg:pl-[68px]" : "lg:pl-64"
        )}
      >
        <AdminHeader />
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 py-4 sm:px-4 lg:px-6 lg:py-5">
          {children}
        </main>
      </div>
    </div>
  );
}
