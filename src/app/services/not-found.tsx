import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";

export default function ServicesNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center p-8 bg-white rounded-2xl border border-kampmax-border">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-4">
          <Wrench className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-xl font-bold text-kampmax-text mb-2">
          Page not found
        </h1>
        <p className="text-sm text-kampmax-text-secondary mb-6">
          The service or provider you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse services
          </Link>
        </div>
      </div>
    </div>
  );
}