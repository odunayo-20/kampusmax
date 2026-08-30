import Link from "next/link";
import { Wrench } from "lucide-react";

/** Minimal public footer for the service marketplace pages. */
export function ServiceMarketplaceFooter() {
  return (
    <footer className="border-t border-kampmax-border bg-white mt-10">
      <div className="max-w-[1280px] mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white">
            <Wrench className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-bold text-kampmax-navy">Kampmax</span>
        </div>
        <p className="text-xs text-kampmax-text-secondary text-center">
          Find trusted services from verified providers around campus.
        </p>
        <Link
          href="/services"
          className="text-xs font-medium text-primary-600 hover:underline"
        >
          Browse services
        </Link>
      </div>
    </footer>
  );
}