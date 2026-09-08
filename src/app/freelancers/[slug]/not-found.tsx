import type { Metadata } from "next";
import Link from "next/link";
import { UserX } from "lucide-react";

export const metadata: Metadata = {
  title: "Freelancer not found | Kampmax",
  robots: { index: false, follow: false },
};

export default function FreelancerNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
        <UserX className="h-8 w-8 text-kampmax-text-secondary" aria-hidden />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-kampmax-text">
        Freelancer not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-kampmax-text-secondary">
        We could not find a freelancer profile with that link. The profile may
        have been removed or the address may be incorrect.
      </p>
      <Link
        href="/jobs"
        className="mt-6 rounded-lg bg-kampmax-blue px-4 py-2 text-sm font-medium text-white hover:bg-kampmax-navy"
      >
        Browse jobs
      </Link>
    </div>
  );
}