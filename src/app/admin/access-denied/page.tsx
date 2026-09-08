import Link from "next/link";
import { Ban } from "lucide-react";

export const metadata = {
  title: "Access denied",
};

export default function AdminAccessDeniedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-kampmax-border bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-kampmax-warning/15">
          <Ban className="h-5 w-5 text-amber-600" />
        </div>
        <h1 className="mt-3 text-base font-semibold text-kampmax-text">
          Permission required
        </h1>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          Your operator role does not include permission for this section.
          Contact a Super Admin to adjust the role&apos;s permissions.
        </p>
        <Link
          href="/admin"
          className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-kampmax-blue px-4 text-sm font-medium text-white transition-colors hover:bg-kampmax-blue-dark"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}