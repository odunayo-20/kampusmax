import type { Metadata } from "next";
import { EmployerSettingsShell } from "@/components/employer/settings";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EmployerSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployerSettingsShell>{children}</EmployerSettingsShell>;
}