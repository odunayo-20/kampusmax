"use client";

import { Plus, ImageIcon, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Skeleton } from "@/components/home/Skeleton";

export function PortfolioGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PortfolioEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <ImageIcon className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-neutral-900">Your portfolio is empty</h3>
      <p className="mt-1 max-w-xs text-xs text-neutral-500">
        Add your best projects to help clients understand your experience and the work you can deliver.
      </p>
      <div className="mt-4">
        <Link href="/freelancer/portfolio/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            Add Project
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function PortfolioErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-50 text-error-600">
        <AlertCircle className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-neutral-900">Something went wrong</h3>
      <p className="mt-1 max-w-xs text-xs text-neutral-500">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

export function PortfolioFormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5">
          <Skeleton className="h-4 w-40" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PortfolioHeader({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Portfolio</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {count > 0
            ? `You have ${count} project${count === 1 ? "" : "s"}.`
            : "Showcase your previous work and case studies to potential clients."}
        </p>
      </div>
      <Link href="/freelancer/portfolio/new">
        <Button className="w-full sm:w-auto">
          <Plus className="mr-1.5 h-4 w-4" aria-hidden />
          Add Project
        </Button>
      </Link>
    </div>
  );
}
