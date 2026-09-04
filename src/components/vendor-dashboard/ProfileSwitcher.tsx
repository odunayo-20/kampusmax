"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  User,
  Store,
  Briefcase,
  Wrench,
  Building2,
  UserCheck,
  Check,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { getVendorAccess, getVendorProfileSummary } from "@/services/vendor-dashboard";
import { getServiceProviderAccess } from "@/services/service-provider-dashboard";
import { getSpProfileByUserId } from "@/data/service-provider";
import { getFreelancerDashboardAccess } from "@/services/freelancer-dashboard";
import { getEmployerDashboardAccess } from "@/services/employer";
import { VendorStatusBadge } from "./VendorStatusBadge";

interface ProfileEntry {
  id: string;
  label: string;
  icon: typeof User;
  active: boolean;
  href?: string;
  onboardLabel?: string;
}

export function ProfileSwitcher({ onClosed }: { onClosed?: () => void }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const access = getVendorAccess();
  const vendor = getVendorProfileSummary();
  const spAccess = getServiceProviderAccess();
  const spProfile = getSpProfileByUserId(user?.id ?? "");
  const flAccess = getFreelancerDashboardAccess();
  const empAccess = getEmployerDashboardAccess();

  const profiles: ProfileEntry[] = [
    { id: "customer", label: "Customer", icon: User, active: true, href: "/home" },
    {
      id: "vendor",
      label: "Vendor",
      icon: Store,
      active: access.kind === "approved",
      href: "/vendor",
      onboardLabel: "Become a Vendor",
    },
    { id: "freelancer", label: "Freelancer", icon: Briefcase, active: flAccess.kind === "approved", href: flAccess.kind === "approved" ? "/freelancer/dashboard" : "/onboarding/freelancer", onboardLabel: "Become a Freelancer" },
    {
      id: "service",
      label: "Service Provider",
      icon: Wrench,
      active: spAccess.kind === "approved",
      href: "/service-provider",
      onboardLabel: "Offer Services",
    },
    { id: "employer", label: "Employer", icon: Building2, active: empAccess.kind === "approved", href: empAccess.kind === "approved" ? "/onboarding/employer" : "/onboarding/employer", onboardLabel: "Become an Employer" },
    { id: "ambassador", label: "Ambassador", icon: UserCheck, active: false, onboardLabel: "Become an Ambassador" },
  ];

  const current = profiles.find((p) => p.id === "vendor" && p.active)
    ? profiles[1]
    : profiles.find((p) => p.id === "service" && p.active)
    ? profiles.find((p) => p.id === "service")!
    : profiles.find((p) => p.id === "freelancer" && p.active)
    ? profiles.find((p) => p.id === "freelancer")!
    : profiles[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
      >
        <User className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown className="h-4 w-4" aria-hidden />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="menu"
            className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-kampmax-border bg-white p-2 shadow-xl"
          >
            <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Current Profile
            </p>
            <ProfileRow
              label={vendor ? "Vendor" : spAccess.kind === "approved" ? "Service Provider" : flAccess.kind === "approved" ? "Freelancer" : current.label}
              icon={current.icon}
              sub={vendor?.storeName ?? spProfile?.displayName ?? user?.name}
              onNavigate={() => {
                setOpen(false);
                onClosed?.();
                if (current.href) router.push(current.href);
              }}
            />

            <p className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Switch Profile
            </p>
            <div className="space-y-0.5">
              {profiles.map((p) => {
                const Icon = p.icon;
                if (p.active) {
                  return (
                    <button
                      key={p.id}
                      role="menuitem"
                      onClick={() => {
                        setOpen(false);
                        onClosed?.();
                        if (p.href) router.push(p.href);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
                      <span className="flex-1 text-left">{p.label}</span>
                      <Check className="h-4 w-4 text-success-600" aria-hidden />
                    </button>
                  );
                }
                if (p.id === "service" && spAccess.kind === "approved" && spProfile) {
                  return (
                    <div key={p.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2">
                      <Icon className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
                      <span className="flex-1 text-sm text-neutral-700">Service Provider</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success-100 text-success-700">
                        Active
                      </span>
                    </div>
                  );
                }
                if (p.id === "vendor" && vendor) {
                  return (
                    <div key={p.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2">
                      <Icon className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
                      <span className="flex-1 text-sm text-neutral-700">Vendor</span>
                      <VendorStatusBadge status={access.status ?? "DRAFT"} />
                    </div>
                  );
                }
                return (
                  p.id === "service"
                    ? (
                      <Link
                        key={p.id}
                        href="/onboarding/service-provider/1"
                        onClick={() => {
                          setOpen(false);
                          onClosed?.();
                        }}
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-50"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-neutral-300" aria-hidden />
                        <span className="flex-1 text-left">{p.onboardLabel ?? p.label}</span>
                      </Link>
                    )
                    : (
                      <Link
                        key={p.id}
                        href={p.href ?? "/account/profiles/vendor/onboarding"}
                        onClick={() => {
                          setOpen(false);
                          onClosed?.();
                        }}
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-50"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-neutral-300" aria-hidden />
                        <span className="flex-1 text-left">{p.onboardLabel ?? p.label}</span>
                      </Link>
                    )
                );
              })}
            </div>

            <div className="mt-2 border-t border-kampmax-border" />
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onClosed?.();
                router.push("/profile");
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <User className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
              Account Settings
            </button>
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onClosed?.();
                router.push("/home");
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <LogOut className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
              Return to Customer Account
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ProfileRow({
  label,
  icon: Icon,
  sub,
  onNavigate,
}: {
  label: string;
  icon: typeof User;
  sub?: string;
  onNavigate: () => void;
}) {
  return (
    <button
      role="menuitem"
      onClick={onNavigate}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-neutral-50",
        "ring-1 ring-primary-600"
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <span className="flex-1 text-left">
        <span className="block text-sm font-semibold text-neutral-900">{label}</span>
        {sub && <span className="block text-xs text-neutral-500 truncate">{sub}</span>}
      </span>
    </button>
  );
}