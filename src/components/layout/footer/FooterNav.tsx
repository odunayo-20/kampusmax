"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { type FooterSection } from "./sections";
import { cn } from "@/lib/utils";

function FooterLinkItem({
  href,
  description,
  children,
}: {
  href: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group text-sm text-kampmax-text-secondary hover:text-kampmax-blue transition-colors inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kampmax-blue rounded-sm"
    >
      <span className="inline-block">{children}</span>
      {description && (
        <span className="block text-xs text-kampmax-text-muted group-hover:text-kampmax-text-secondary leading-snug">
          {description}
        </span>
      )}
    </Link>
  );
}

function SectionTitle({ section }: { section: FooterSection }) {
  return (
    <h3
      className={cn(
        "text-sm font-bold text-kampmax-text mb-3",
        section.highlight && "text-kampmax-navy"
      )}
    >
      {section.title}
    </h3>
  );
}

function DesktopColumns({ sections }: { sections: FooterSection[] }) {
  return (
    <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
      {sections.map((section) => (
        <nav
          key={section.id}
          aria-label={section.title}
          className={cn(section.highlight && "lg:pr-4")}
        >
          <SectionTitle section={section} />
          <ul className="space-y-1">
            {section.links.map((link) => (
              <li key={link.label}>
                <FooterLinkItem href={link.href} description={link.description}>
                  {link.label}
                </FooterLinkItem>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>
  );
}

function MobileAccordion({ sections }: { sections: FooterSection[] }) {
  const [openIds, setOpenIds] = useState<string[]>(["join"]);

  const toggle = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="md:hidden divide-y divide-kampmax-border border-y border-kampmax-border mb-6">
      {sections.map((section) => {
        const isOpen = openIds.includes(section.id);
        return (
          <div key={section.id}>
            <button
              type="button"
              onClick={() => toggle(section.id)}
              aria-expanded={isOpen}
              aria-controls={`footer-section-${section.id}`}
              className="w-full flex items-center justify-between py-3.5 pr-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kampmax-blue rounded-sm"
            >
              <span
                className={cn(
                  "text-sm font-bold text-kampmax-text",
                  section.highlight && "text-kampmax-navy"
                )}
              >
                {section.title}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-kampmax-text-secondary transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <div id={`footer-section-${section.id}`} className="pb-3">
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <FooterLinkItem
                        href={link.href}
                        description={link.description}
                      >
                        {link.label}
                      </FooterLinkItem>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FooterNav({ sections }: { sections: FooterSection[] }) {
  return (
    <>
      <DesktopColumns sections={sections} />
      <MobileAccordion sections={sections} />
    </>
  );
}