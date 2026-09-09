"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminVendorQueueRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/vendors?queue=pending_verification");
  }, [router]);

  return null;
}