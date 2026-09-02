"use client";

import { cn } from "@/lib/utils";
import type { SpAnalyticsStatus, SpStatusSlice } from "@/types/service-provider-analytics";

interface SpAnalyticsStatusDonutProps {
  status: SpAnalyticsStatus;
}

const R = 15.915;
const CIRCUMFERENCE = 2 * Math.PI * R;

/** Bookings status donut. Shares are backend-computed (fraction per slice);
 * this component only lays them out visually. */
export function SpAnalyticsStatusDonut({ status }: SpAnalyticsStatusDonutProps) {
  if (status.total === 0) {
    return (
      <div className="rounded-xl border border-kampmax-border bg-white p-4">
        <h3 className="text-sm font-semibold text-kampmax-text">Bookings by status</h3>
        <p className="py-10 text-center text-sm text-kampmax-text-secondary">No bookings in this period</p>
      </div>
    );
  }

  let cumulative = 0;
  const segments = status.slices.map((s) => {
    const start = (cumulative / status.total) * CIRCUMFERENCE;
    cumulative += s.count;
    const len = (s.count / status.total) * CIRCUMFERENCE;
    return { ...s, start, len };
  });

  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-4">
      <h3 className="text-sm font-semibold text-kampmax-text">Bookings by status</h3>
      <p className="mt-0.5 text-xs text-kampmax-text-secondary">{status.total} bookings</p>

      <div className="mt-4 flex items-center gap-6">
        <svg viewBox="0 0 42 42" className="h-36 w-36 shrink-0" role="img" aria-label="Booking status distribution">
          <circle cx="21" cy="21" r={R} fill="transparent" stroke="rgba(11,31,58,0.08)" strokeWidth="6" />
          {segments.map((seg) => (
            <circle
              key={seg.status}
              cx="21"
              cy="21"
              r={R}
              fill="transparent"
              stroke={seg.color}
              strokeWidth="6"
              strokeDasharray={`${seg.len} ${CIRCUMFERENCE - seg.len}`}
              strokeDashoffset={-seg.start}
            />
          ))}
          <text x="21" y="22" textAnchor="middle" fontSize="7" fontWeight="700" fill="#0B1F3A">
            {status.total}
          </text>
          <text x="21" y="27" textAnchor="middle" fontSize="4" fill="#64748B">
            total
          </text>
        </svg>

        <ul className="min-w-0 flex-1 space-y-2">
          {segments.map((seg) => (
            <li key={seg.status} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: seg.color }} aria-hidden />
              <span className="min-w-0 flex-1 truncate text-kampmax-text-secondary">{seg.label}</span>
              <span className="shrink-0 font-medium tabular-nums text-kampmax-text">
                {seg.count}
                <span className="text-kampmax-text-secondary"> · {Math.round(seg.fraction * 100)}%</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
