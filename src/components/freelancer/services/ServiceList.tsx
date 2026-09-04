"use client";

import type { FreelancerService } from "@/types/freelancer-services";
import { ServiceCard } from "./ServiceCard";

export function ServiceList({
  services,
  onAction,
}: {
  services: FreelancerService[];
  onAction?: (service: FreelancerService) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} onAction={onAction} />
      ))}
    </div>
  );
}
