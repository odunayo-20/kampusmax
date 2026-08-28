"use client";

import { MapPin, Clock, CalendarDays, Tag, Zap } from "lucide-react";
import type { Storefront } from "@/types/storefront";

interface StoreAboutProps {
  store: Storefront;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-kampmax-muted flex items-center justify-center text-kampmax-text-secondary shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
          {label}
        </p>
        <p className="text-sm font-medium text-kampmax-text">{value}</p>
      </div>
    </div>
  );
}

/** Public "About Store" section (only public info — no private details). */
export function StoreAbout({ store }: StoreAboutProps) {
  const a = store.about;
  const responseTime = a?.responseTime || store.responseTime;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-kampmax-border p-5 sm:p-6">
        <h2 className="text-base font-bold text-kampmax-text mb-2">
          About {store.storeName}
        </h2>
        <p className="text-sm text-kampmax-text-secondary leading-relaxed">
          {a?.description || store.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          <InfoItem
            icon={<MapPin className="h-4 w-4" />}
            label="Campus"
            value={a?.campus || store.campusName}
          />
          {a?.businessCategory && (
            <InfoItem icon={<Tag className="h-4 w-4" />} label="Category" value={a.businessCategory} />
          )}
          {a?.operatingHours && (
            <InfoItem icon={<Clock className="h-4 w-4" />} label="Operating hours" value={a.operatingHours} />
          )}
          {a?.established && (
            <InfoItem icon={<CalendarDays className="h-4 w-4" />} label="Established" value={a.established} />
          )}
          {responseTime && (
            <InfoItem icon={<Zap className="h-4 w-4" />} label="Response time" value={responseTime} />
          )}
        </div>
      </div>

      {store.specialties.length > 0 && (
        <div className="bg-white rounded-xl border border-kampmax-border p-5 sm:p-6">
          <h2 className="text-base font-bold text-kampmax-text mb-3">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {store.specialties.map((s) => (
              <span
                key={s}
                className="px-3 py-1 bg-kampmax-muted text-kampmax-text-secondary rounded-full text-xs font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
