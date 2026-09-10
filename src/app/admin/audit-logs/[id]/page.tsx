"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AuditLogDetailView } from "@/components/admin/audit-logs/AuditLogDetailView";
import { useAdminAuditEvent } from "@/hooks/admin/use-admin-audit-trail";

export default function AdminAuditLogDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const event = useAdminAuditEvent(id);

  return (
    <>
      <AdminPageHeader
        title="Audit Event"
        description="Read-only immutable record of a privileged admin action."
        actions={
          <Link
            href="/admin/audit-logs"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text hover:bg-kampmax-muted/60"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to audit logs
          </Link>
        }
      />

      <div className="my-3">
        <AuditLogDetailView
          event={event.data ?? null}
          loading={event.isLoading}
          error={event.isError}
          onRetry={() => void event.refetch()}
        />
      </div>
    </>
  );
}