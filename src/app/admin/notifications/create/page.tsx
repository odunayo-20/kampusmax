"use client";

import { useRouter } from "next/navigation";
import { CreateNotificationForm } from "@/components/admin/notifications/CreateNotificationForm";

export default function CreateNotificationPage() {
  const router = useRouter();

  return (
    <CreateNotificationForm
      onCreated={() => router.push("/admin/notifications")}
      onBack={() => router.push("/admin/notifications")}
    />
  );
}
