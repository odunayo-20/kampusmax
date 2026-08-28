import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Store not found | Kampmax",
  robots: { index: false, follow: false },
};

export default function StoreNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-4xl font-black text-kampmax-blue">404</p>
      <h1 className="mt-3 text-2xl font-bold text-kampmax-text">
        Store not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-kampmax-text-secondary">
        We could not find a store with that link. The store may have been closed
        or the address may be incorrect.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-kampmax-blue px-4 py-2 text-sm font-medium text-white hover:bg-kampmax-navy"
      >
        Go to Kampmax
      </Link>
    </div>
  );
}
