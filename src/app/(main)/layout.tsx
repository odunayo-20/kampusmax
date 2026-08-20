import { BottomNav, TopBar } from "@/components/layout";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-kampmax-bg">
      <TopBar />
      <main className="max-w-lg mx-auto pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
