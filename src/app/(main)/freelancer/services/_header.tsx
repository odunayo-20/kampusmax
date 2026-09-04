import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ServiceCreateHeader({ title, backTo = "/freelancer/services" }: { title: string; backTo?: string }) {
  return (
    <div>
      <Link
        href={backTo}
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to My Services
      </Link>
      <h1 className="mt-2 text-xl font-bold text-neutral-900">{title}</h1>
    </div>
  );
}
