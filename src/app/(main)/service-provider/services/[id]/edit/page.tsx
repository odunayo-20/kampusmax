"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ServiceForm } from "@/components/service-provider/dashboard/ServiceForm";
import { getSpServices, updateSpDashboardService } from "@/services/service-provider-dashboard";
import type { ServiceProviderServiceInput } from "@/types/service-provider-dashboard";

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [notFound] = useState(() => {
    const service = getSpServices().find((s) => s.id === params.id);
    return !service;
  });

  if (notFound) {
    return (
      <div className="rounded-xl border border-kampmax-border bg-white p-10 text-center">
        <p className="text-sm font-medium text-kampmax-text">Service not found.</p>
        <button
          type="button"
          onClick={() => router.push("/service-provider/services")}
          className="mt-3 text-sm font-medium text-primary-600 hover:underline"
        >
          Back to services
        </button>
      </div>
    );
  }

  const service = getSpServices().find((s) => s.id === params.id);

  function handleSubmit(input: ServiceProviderServiceInput) {
    const res = updateSpDashboardService(params.id, input);
    if (res.ok) router.push("/service-provider/services");
    return { ok: res.ok, error: res.error };
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-kampmax-text">Edit service</h1>
        <p className="mt-1 text-sm text-kampmax-text-secondary">Update the details below. Public profile updates immediately.</p>
      </div>
      <div className="rounded-xl border border-kampmax-border bg-white p-6">
        <ServiceForm
          key={service!.id}
          initial={service}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/service-provider/services")}
        />
      </div>
    </div>
  );
}