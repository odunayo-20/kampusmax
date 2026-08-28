import Link from "next/link";
import { Package } from "lucide-react";

/** Minimal public footer for storefront pages. */
export function StorePublicFooter() {
  return (
    <footer className="border-t border-kampmax-border bg-white mt-10">
      <div className="max-w-[1280px] mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-kampmax-navy flex items-center justify-center text-white">
            <Package className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-bold text-kampmax-navy">Kampmax</span>
        </div>
        <p className="text-xs text-kampmax-text-secondary text-center">
          Your campus marketplace. Buy and sell with students around you.
        </p>
        <Link
          href="/marketplace"
          className="text-xs font-medium text-kampmax-blue hover:underline"
        >
          Browse marketplace
        </Link>
      </div>
    </footer>
  );
}
