import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function SupportLoading() {
  return (
    <PageContainer className="space-y-4">
      <Breadcrumbs items={[{ label: "Profile", href: "/profile" }, { label: "Support" }]} />
      <div className="h-10 w-1/3 animate-pulse rounded-lg bg-kampmax-muted" />
      <div className="h-24 animate-pulse rounded-xl bg-kampmax-muted" />
      <div className="space-y-2">
        <div className="h-16 animate-pulse rounded-xl bg-kampmax-muted" />
        <div className="h-16 animate-pulse rounded-xl bg-kampmax-muted" />
      </div>
    </PageContainer>
  );
}