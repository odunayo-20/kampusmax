import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
} from "lucide-react";

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "twitter"
  | "whatsapp"
  | "linkedin";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  href: string;
}

/**
 * Configured social profiles. Only entries with a non-empty `href` are
 * rendered — empty URLs are treated as "not yet configured" and skipped.
 * These are external destinations, so they use plain anchor tags.
 */
export const socialLinks: SocialLink[] = [
  { platform: "instagram", label: "Instagram", href: "" },
  { platform: "facebook", label: "Facebook", href: "" },
  { platform: "twitter", label: "X (Twitter)", href: "" },
  { platform: "whatsapp", label: "WhatsApp", href: "" },
  { platform: "linkedin", label: "LinkedIn", href: "" },
];

export function getSocialIcon(platform: SocialPlatform) {
  switch (platform) {
    case "instagram":
      return Instagram;
    case "facebook":
      return Facebook;
    case "twitter":
      return Twitter;
    case "whatsapp":
      return MessageCircle;
    case "linkedin":
      return Linkedin;
  }
}

export function getConfiguredSocialLinks(): SocialLink[] {
  return socialLinks.filter((link) => link.href.length > 0);
}
