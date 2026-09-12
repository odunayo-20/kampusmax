"use client";

import { Clock, Mail, MessageCircle, Phone, ShieldAlert } from "lucide-react";
import { supportContact } from "@/data/profile";
import { SUPPORT_SECURITY_NOTICE } from "@/config/support";

/**
 * Persistent contact strip on the support pages. The portal is the primary
 * channel; the WhatsApp/call/email lines are the alternative routes already
 * declared in the app (Help & Support) — mirrored here so they appear where
 * tickets live, without inventing new numbers.
 */
export function SupportContactBanner() {
  return (
    <section className="rounded-xl border border-kampmax-border bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-kampmax-border">
        <a
          href={`https://wa.me/${supportContact.whatsapp.replace(/\s/g, "").replace("+", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3"
        >
          <MessageCircle className="h-4 w-4 text-kampmax-blue shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-kampmax-text">WhatsApp</p>
            <p className="text-[11px] text-kampmax-text-secondary truncate">
              {supportContact.whatsapp}
            </p>
          </div>
        </a>
        <a
          href={`tel:${supportContact.phone.replace(/\s/g, "")}`}
          className="flex items-center gap-3 px-4 py-3"
        >
          <Phone className="h-4 w-4 text-kampmax-blue shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-kampmax-text">Call us</p>
            <p className="text-[11px] text-kampmax-text-secondary truncate">
              {supportContact.phone}
            </p>
          </div>
        </a>
        <a
          href={`mailto:${supportContact.email}`}
          className="flex items-center gap-3 px-4 py-3"
        >
          <Mail className="h-4 w-4 text-kampmax-blue shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-kampmax-text">Email</p>
            <p className="text-[11px] text-kampmax-text-secondary truncate">
              {supportContact.hours}
            </p>
          </div>
        </a>
      </div>

      <div className="flex items-center gap-2 border-t border-kampmax-border px-4 py-2.5">
        <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        <p className="text-[11px] text-kampmax-text-secondary">
          {SUPPORT_SECURITY_NOTICE}
        </p>
        <Clock className="h-3.5 w-3.5 text-kampmax-text-secondary/60 ml-auto shrink-0" />
        <p className="text-[11px] text-kampmax-text-secondary shrink-0">
          {supportContact.hours}
        </p>
      </div>
    </section>
  );
}