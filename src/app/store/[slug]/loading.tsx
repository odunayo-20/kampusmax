import { StoreHeaderSkeleton, StoreProductsSkeleton } from "@/components/storefront";

export default function StoreLoading() {
  return (
    <div className="space-y-6">
      <StoreHeaderSkeleton />
      <StoreProductsSkeleton />
    </div>
  );
}
