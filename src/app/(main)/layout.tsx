import { BottomNav } from "@/components/organisms/BottomNav";
import { TopBar } from "@/components/organisms/TopBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-kampmax-bg">
      <TopBar />
      <main className="max-w-lg mx-auto pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
