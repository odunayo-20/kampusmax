import { StorePublicHeader } from "@/components/storefront/StorePublicHeader";
import { StorePublicFooter } from "@/components/storefront/StorePublicFooter";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-kampmax-bg flex flex-col">
      <StorePublicHeader />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 py-6">
        {children}
      </main>
      <StorePublicFooter />
    </div>
  );
}
