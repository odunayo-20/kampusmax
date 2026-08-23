import type { Metadata } from "next";
// Root layout already provides the customer app contexts
// (Auth/App/Cart) globally; the admin panel adds only its own.
import { AdminSessionProvider } from "@/lib/admin/admin-auth-context";
import { AdminUIProvider } from "@/lib/admin/admin-ui-context";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: {
    default: "Kampmax Admin",
    template: "%s · Kampmax Admin",
  },
  description: "Kampmax platform operations console",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSessionProvider>
      <AdminUIProvider>
        <AdminShell>{children}</AdminShell>
      </AdminUIProvider>
    </AdminSessionProvider>
  );
}
