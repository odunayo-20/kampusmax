"use client";

import type { ComponentType } from "react";
import { Search, FileText, Handshake, Wallet } from "lucide-react";

export type FreelancerSectionKey = "opportunities" | "proposals" | "contracts" | "earnings";

const SECTION_CONFIG: Record<
  FreelancerSectionKey,
  { icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>; tone: string; title: string; description: string; hint: string }
> = {
  opportunities: {
    icon: Search,
    tone: "bg-primary-50 text-primary-600",
    title: "Find work",
    description: "Browse open projects and opportunities matched to your skills.",
    hint: "Available in a future release.",
  },
  proposals: {
    icon: FileText,
    tone: "bg-info-50 text-info-700",
    title: "Your proposals",
    description: "Track proposals you've sent to clients and their status.",
    hint: "Available in a future release.",
  },
  contracts: {
    icon: Handshake,
    tone: "bg-success-50 text-success-600",
    title: "Your contracts",
    description: "Manage active and completed contracts in one place.",
    hint: "Available in a future release.",
  },
  earnings: {
    icon: Wallet,
    tone: "bg-yellow-50 text-yellow-700",
    title: "Earnings",
    description: "Review payments, payouts and earnings history.",
    hint: "Available in a future release.",
  },
};

/** True empty-state card for future-module sections (M23–M25). Never fakes
 * activity or money figures — these sections are explicitly not built yet. */
export function FreelancerEmptySection({ id, href }: { id: FreelancerSectionKey; href: string }) {
  const c = SECTION_CONFIG[id];
  const Icon = c.icon;
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-kampmax-border bg-white p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.tone}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-bold text-kampmax-text">{c.title}</p>
        <p className="mt-1 text-xs text-kampmax-text-secondary">{c.description}</p>
      </div>
      <p className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-medium text-kampmax-text-muted">
        {c.hint}
      </p>
    </div>
  );
}
