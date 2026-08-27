"use client";

import { Shield, Award, Package } from "lucide-react";

export function TrustSignals() {
  const signals = [
    {
      icon: Shield,
      title: "Buyer Protection",
      description: "Secure checkout",
      color: "text-success-600",
    },
    {
      icon: Award,
      title: "Verified Vendor",
      description: "Trusted sellers",
      color: "text-primary-600",
    },
    {
      icon: Package,
      title: "Campus Delivery",
      description: "On-campus pickup",
      color: "text-neutral-600",
    },
  ];

  return (
    <section className="grid grid-cols-3 gap-3">
      {signals.map((signal) => (
        <div key={signal.title} className="rounded-[10px] border border-neutral-200 bg-white p-3 text-center">
          <signal.icon className={`h-5 w-5 mx-auto ${signal.color}`} />
          <p className="mt-1 text-xs font-semibold text-neutral-900">{signal.title}</p>
          <p className="text-[11px] text-neutral-500">{signal.description}</p>
        </div>
      ))}
    </section>
  );
}