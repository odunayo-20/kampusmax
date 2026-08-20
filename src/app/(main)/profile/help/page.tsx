"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, HelpCircle, MessageCircle, Phone, Mail,
  ChevronDown, ChevronUp, ExternalLink, Search,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsGroup, SettingsRow } from "@/components/profile/SettingsGroup";
import { faqItems, supportContact } from "@/data/profile";

export default function HelpSupportPage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqItems.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Profile", href: "/profile" },
          { label: "Help & Support" },
        ]}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <h1 className="text-lg font-bold text-kampmax-text">Help & Support</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kampmax-text-secondary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for help..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kampmax-border text-sm text-kampmax-text bg-white focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
        />
      </div>

      {/* Contact */}
      <div className="bg-gradient-to-br from-kampmax-navy to-kampmax-blue rounded-xl p-5 text-white">
        <h2 className="text-sm font-bold mb-3">Need Help?</h2>
        <div className="space-y-2.5">
          <a
            href={`https://wa.me/${supportContact.whatsapp.replace(/\s/g, "").replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 py-2"
          >
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">WhatsApp</p>
              <p className="text-xs text-white/70">{supportContact.whatsapp}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-white/50" />
          </a>
          <a
            href={`tel:${supportContact.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-3 py-2"
          >
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Phone className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Call Us</p>
              <p className="text-xs text-white/70">{supportContact.phone}</p>
            </div>
          </a>
          <a
            href={`mailto:${supportContact.email}`}
            className="flex items-center gap-3 py-2"
          >
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-white/70">{supportContact.email}</p>
            </div>
          </a>
        </div>
        <p className="text-[11px] text-white/50 mt-3">
          {supportContact.hours}
        </p>
      </div>

      {/* FAQ */}
      <SettingsGroup
        title="Frequently Asked Questions"
        description={`${filteredFaqs.length} questions`}
      >
        {filteredFaqs.length === 0 ? (
          <div className="p-6 text-center">
            <HelpCircle className="h-8 w-8 text-kampmax-text-secondary mx-auto mb-2" />
            <p className="text-xs text-kampmax-text-secondary">No matching questions found</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div key={faq.id}>
              <button
                onClick={() =>
                  setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                }
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <HelpCircle className="h-4 w-4 text-kampmax-blue flex-shrink-0" />
                <span className="flex-1 text-sm font-medium text-kampmax-text">
                  {faq.question}
                </span>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="h-4 w-4 text-kampmax-text-secondary flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-kampmax-text-secondary flex-shrink-0" />
                )}
              </button>
              {expandedFaq === faq.id && (
                <div className="px-4 pb-3 pl-11">
                  <p className="text-xs text-kampmax-text-secondary leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </SettingsGroup>

      {/* Report */}
      <SettingsGroup title="Report a Problem">
        <SettingsRow
          icon={<span className="text-lg">🐛</span>}
          label="Report a Bug"
          description="Found something broken? Let us know"
          action={<ExternalLink className="h-4 w-4 text-kampmax-text-secondary" />}
          onClick={() => {}}
        />
        <SettingsRow
          icon={<span className="text-lg">💡</span>}
          label="Feature Request"
          description="Suggest a new feature for Kampmax"
          action={<ExternalLink className="h-4 w-4 text-kampmax-text-secondary" />}
          onClick={() => {}}
        />
        <SettingsRow
          icon={<span className="text-lg">🚩</span>}
          label="Report a User"
          description="Flag suspicious or harmful behavior"
          action={<ExternalLink className="h-4 w-4 text-kampmax-text-secondary" />}
          onClick={() => {}}
        />
      </SettingsGroup>

      {/* Footer */}
      <div className="text-center pb-4">
        <p className="text-xs text-kampmax-text-secondary">
          Kampmax v1.0 &middot; Made for Nigerian campuses
        </p>
      </div>
    </PageContainer>
  );
}
