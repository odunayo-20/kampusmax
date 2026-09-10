"use client";

import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { NotificationDetail } from "@/components/admin/notifications/NotificationDetail";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";

export default function NotificationDetailPage() {
  return (
    <Suspense fallback={<LoadingSkeleton rows={4} />}>
      <NotificationDetailInner />
    </Suspense>
  );
}

function NotificationDetailInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <NotificationDetail
      id={params.id}
      onBack={() => router.push("/admin/notifications")}
    />
  );
}
