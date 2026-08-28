"use client";

import Link from "next/link";
import {
  MapPin,
  ChevronRight,
  BadgeCheck,
  Lock,
  ShieldCheck,
  GraduationCap,
  Store,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { PageContainer } from "@/components/layout/PageContainer";
import { footerSections, getContextualLinks } from "./sections";
import { FooterNav } from "./FooterNav";
import { CampusSelector } from "./CampusSelector";
import { SocialLinks } from "./SocialLinks";

function FooterCta() {
  return (
    <div className="rounded-2xl border border-kampmax-border bg-white p-6 sm:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="max-w-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-kampmax-text tracking-tight">
            Everything you need, closer to you.
          </h2>
          <p className="text-sm text-kampmax-text-secondary mt-1.5">
            Discover products, services and opportunities around your campus.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center h-12 px-5 text-sm font-semibold rounded-md bg-kampmax-blue text-white hover:bg-kampmax-blue-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kampmax-blue focus-visible:ring-offset-2"
          >
            Start Shopping
          </Link>
          <Link
            href="/vendor"
            className="inline-flex items-center justify-center h-12 px-5 text-sm font-semibold rounded-md border border-kampmax-border bg-white text-kampmax-text hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kampmax-blue"
          >
            Become a Vendor
          </Link>
        </div>
      </div>
    </div>
  );
}

const trustItems = [
  {
    icon: Lock,
    label: "Secure Payments",
    description: "Payments are encrypted and handled through secure channels.",
  },
  {
    icon: BadgeCheck,
    label: "Verified Vendors",
    description: "Vendors are reviewed before they can sell on Kampmax.",
  },
  {
    icon: ShieldCheck,
    label: "Protected Transactions",
    description: "Escrow protection keeps buyers and sellers covered.",
  },
  {
    icon: GraduationCap,
    label: "Campus-focused",
    description: "Products and services matched to your campus community.",
  },
];

function TrustRow() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-y border-kampmax-border mb-8">
      {trustItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-start gap-3">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-kampmax-blue/10 flex items-center justify-center">
              <Icon className="h-[18px] w-[18px] text-kampmax-blue" />
            </div>
            <div>
              <p className="text-sm font-semibold text-kampmax-text">
                {item.label}
              </p>
              <p className="text-xs text-kampmax-text-secondary leading-snug mt-0.5">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FooterBrand() {
  const { selectedCampus } = useApp();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/home" className="inline-flex items-center gap-1.5">
          <span className="text-xl font-bold text-kampmax-navy tracking-tight">
            Kampmax
          </span>
        </Link>
        <p className="text-sm text-kampmax-text-secondary mt-2 max-w-sm leading-relaxed">
          Your campus marketplace for products, services, jobs and
          opportunities.
        </p>
      </div>

      <div className="max-w-xs">
        <p className="text-sm text-kampmax-text-secondary mb-1.5">
          Shopping around a campus?
        </p>
        <p className="text-xs text-kampmax-text-muted mb-3">
          Choose your campus to see relevant products, vendors and services.
        </p>
        <CampusSelector />
        {selectedCampus && (
          <p className="text-xs text-kampmax-text-muted mt-2 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Currently shopping near {selectedCampus.name}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold text-kampmax-text mb-3">Follow us</h3>
        <SocialLinks />
      </div>
    </div>
  );
}

function ContextualNav() {
  const { user } = useAuth();
  if (!user) return null;

  const links = getContextualLinks(user.role);
  if (links.length === 0) return null;

  return (
    <div className="bg-neutral-50 border border-kampmax-border rounded-xl p-4 sm:p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Store className="h-4 w-4 text-kampmax-blue" />
        <h3 className="text-sm font-bold text-kampmax-text">
          Your Kampmax shortcuts
        </h3>
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1">
        {links.map((link) =>
          link.placeholder ? (
            <li key={link.label}>
              <span className="text-sm text-kampmax-text-secondary/80 cursor-not-allowed inline-block py-0.5">
                {link.label}
              </span>
            </li>
          ) : (
            <li key={link.label}>
              <Link
                href={link.href}
                className="group flex items-center gap-1 text-sm text-kampmax-text-secondary hover:text-kampmax-blue transition-colors inline-block py-0.5"
              >
                {link.label}
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

function FooterBottom() {
  return (
    <div className="pt-6 mt-8 border-t border-kampmax-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-xs text-kampmax-text-muted">
          © 2026 Kampmax · Nigeria · ₦ NGN
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          <li>
            <Link
              href="/profile/help"
              className="text-xs text-kampmax-text-muted hover:text-kampmax-text transition-colors"
            >
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link
              href="/profile/help"
              className="text-xs text-kampmax-text-muted hover:text-kampmax-text transition-colors"
            >
              Terms &amp; Conditions
            </Link>
          </li>
          <li>
            <Link
              href="/profile/help"
              className="text-xs text-kampmax-text-muted hover:text-kampmax-text transition-colors"
            >
              Refund Policy
            </Link>
          </li>
          <li>
            <Link
              href="/profile/help"
              className="text-xs text-kampmax-text-muted hover:text-kampmax-text transition-colors"
            >
              Cookie Policy
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-kampmax-border mt-10">
      <PageContainer className="py-10 lg:py-12">
        <FooterCta />

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
          <div className="lg:w-80 lg:shrink-0">
            <FooterBrand />
          </div>
          <div className="flex-1 min-w-0">
            <FooterNav sections={footerSections} />
          </div>
        </div>

        <div className="mt-8">
          <ContextualNav />
        </div>

        <TrustRow />

        <FooterBottom />
      </PageContainer>
    </footer>
  );
}
