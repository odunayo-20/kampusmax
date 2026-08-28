import { cn } from "@/lib/utils";
import {
  getConfiguredSocialLinks,
  getSocialIcon,
} from "./social-config";

export function SocialLinks({ className }: { className?: string }) {
  const links = getConfiguredSocialLinks();

  if (links.length === 0) return null;

  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {links.map((link) => {
        const Icon = getSocialIcon(link.platform);
        return (
          <li key={link.platform}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="h-9 w-9 flex items-center justify-center rounded-md border border-kampmax-border bg-white text-kampmax-text-secondary hover:text-kampmax-blue hover:border-kampmax-blue/40 hover:bg-kampmax-blue/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kampmax-blue"
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
