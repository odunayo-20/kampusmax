"use client";

import { use } from "react";
import { ServiceProviderBookingDetailView } from "@/components/booking/ServiceProviderBookingDetailView";

export default function ServiceProviderBookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  return <ServiceProviderBookingDetailView bookingId={bookingId} />;
}