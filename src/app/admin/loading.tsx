import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";

export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading admin page">
      <div className="mb-4 h-6 w-48 animate-pulse rounded bg-kampmax-muted" />
      <LoadingSkeleton variant="cards" rows={4} className="mb-4" />
      <LoadingSkeleton variant="table" rows={6} />
    </div>
  );
}