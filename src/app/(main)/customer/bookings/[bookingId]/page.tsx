"use client";

import { use } from "react";
import { CustomerBookingDetailView } from "@/components/booking/CustomerBookingDetailView";

export default function CustomerBookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  return <CustomerBookingDetailView bookingId={bookingId} />;
}