"use client";

import { MapPin, Store, Truck, Clock, Shield } from "lucide-react";

interface CampusDeliveryProps {
  campus: {
    id: string;
    name: string;
    abbreviation: string;
    location: string;
  };
  productLocation?: string;
  onPickupLocationChange?: (location: string) => void;
}

const deliveryOptions = [
  { label: "Campus Pickup", price: 0, eta: "Today", icon: Store },
  { label: "Standard Delivery", price: 1000, eta: "Tomorrow", icon: Truck },
  { label: "Express Delivery", price: 2000, eta: "2 hours", icon: Clock },
];

export function CampusDelivery({ campus, productLocation }: CampusDeliveryProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border border-campus-100 bg-campus-50 p-4">
        <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-campus-600" /> Available around
        </h3>
        <p className="text-sm font-medium text-neutral-900 mt-1">{campus.name}</p>
        <p className="text-xs text-neutral-600">{campus.location}</p>
        <div className="mt-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-neutral-600">Pickup location</span>
            <span className="font-medium text-neutral-900">{productLocation || "Student Union Building"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Estimated delivery</span>
            <span className="font-medium text-success-700">Today, 2–5 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Distance</span>
            <span className="font-medium text-neutral-900">On campus · 0.3 km</span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-neutral-500">Privacy: exact vendor address is not shown.</p>
      </div>

      <div className="rounded-[10px] border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
          <Truck className="h-4 w-4 text-primary-600" /> Delivery
        </h3>
        <p className="text-xs text-neutral-600 mt-1">
          Delivering to: <span className="font-medium text-neutral-900">{campus.abbreviation}</span>
        </p>
        <div className="mt-3 space-y-2">
          {deliveryOptions.map((opt) => (
            <label
              key={opt.label}
              className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2.5 hover:border-neutral-300 cursor-pointer"
            >
              <span className="flex items-center gap-2 text-sm">
                <input type="radio" name="delivery" defaultChecked={opt.price === 0} className="accent-primary-600" />
                <opt.icon className="h-4 w-4 text-neutral-500" />
                <span className="font-medium text-neutral-900">{opt.label}</span>
                <span className="text-xs text-neutral-500">· {opt.eta}</span>
              </span>
              <span className="text-sm font-semibold text-neutral-900">{opt.price === 0 ? "Free" : `₦${opt.price.toLocaleString()}`}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-neutral-500">Fees shown are estimates; final fee confirmed at checkout.</p>
      </div>
    </div>
  );
}