import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicFreelancerBySlug } from "@/services/freelancer-dashboard";
import { getPublicFreelancerServices } from "@/services/freelancer-services";
import { getSiteBaseUrl, truncateText } from "@/lib/utils";
import { PublicFreelancerProfileContent } from "@/components/freelancer/public/PublicFreelancerProfileContent";

interface FreelancerPageProps {
  params: Promise<{ slug: string }>;
}

const MAX_DESCRIPTION_LENGTH = 155;

export async function generateMetadata({
  params,
}: FreelancerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = getPublicFreelancerBySlug(slug);

  if (!profile) {
    return {
      title: "Freelancer not found | Kampmax",
      description: "This freelancer profile could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `${getSiteBaseUrl()}/freelancers/${profile.slug}`;
  const description =
    truncateText(profile.bio ?? "", MAX_DESCRIPTION_LENGTH) ||
    (profile.headline ? `${profile.name} — ${profile.headline}.` : `${profile.name} on Kampmax.`);

  return {
    title: `${profile.name}${profile.headline ? ` — ${profile.headline}` : ""} | Kampmax`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${profile.name} | Kampmax`,
      description,
      url: canonical,
      type: "profile",
      siteName: "Kampmax",
      firstName: profile.name.split(" ")[0],
      lastName: profile.name.split(" ").slice(1).join(" ") || undefined,
    },
    twitter: {
      card: "summary",
      title: `${profile.name} | Kampmax`,
      description,
    },
  };
}

export default async function FreelancerPage({ params }: FreelancerPageProps) {
  const { slug } = await params;
  const profile = getPublicFreelancerBySlug(slug);

  if (!profile) {
    notFound();
  }

  const services = getPublicFreelancerServices(profile.id);

  return <PublicFreelancerProfileContent profile={profile} services={services} />;
}