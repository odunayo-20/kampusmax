"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, Calendar, Star, MapPin, Plus, Edit, Eye, ExternalLink, DollarSign, Clock, Wrench, Briefcase, Shield, Image, BadgeCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { getSpOnboardingSummary, getSpOnboardingStatus } from "@/services/service-provider";
import { getSpProfileByUserId } from "@/data/service-provider";
import { formatNaira } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ServiceProviderProfile, ServiceProviderOnboardingStatus } from "@/types/service-provider";

const SERVICE_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  draft: "Draft",
  inactive: "Inactive",
  pending_review: "Pending",
  rejected: "Rejected",
};

const SERVICE_STATUS_COLORS: Record<string, string> = {
  active: "bg-success-100 text-success-700",
  draft: "bg-neutral-100 text-neutral-700",
  inactive: "bg-neutral-100 text-neutral-700",
  pending_review: "bg-warning-100 text-warning-700",
  rejected: "bg-error-100 text-error-700",
};

export default function ServiceProviderDashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<{
    hasServiceProviderProfile: boolean;
    status: ServiceProviderOnboardingStatus | null;
    displayName?: string;
  } | null>(null);
  const [profile, setProfile] = useState<ServiceProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [summaryData, profileData] = await Promise.all([
          Promise.resolve(getSpOnboardingSummary()),
          Promise.resolve(getSpProfileByUserId("u1")), // demo user
        ]);
        setSummary(summaryData);
        setProfile(profileData ?? null);
      } catch (e) {
        console.error("Failed to load dashboard", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getStatusLabel = (status: ServiceProviderOnboardingStatus | null): string => {
    const labels: Record<ServiceProviderOnboardingStatus, string> = {
      DRAFT: "Draft",
      IN_PROGRESS: "In Progress",
      PENDING_REVIEW: "Under Review",
      MORE_INFORMATION_REQUIRED: "More Info Needed",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      SUSPENDED: "Suspended",
    };
    return labels[status ?? "DRAFT"];
  };

  const getStatusColor = (status: ServiceProviderOnboardingStatus | null): string => {
    const colors: Record<ServiceProviderOnboardingStatus, string> = {
      DRAFT: "bg-neutral-100 text-neutral-700",
      IN_PROGRESS: "bg-info-100 text-info-700",
      PENDING_REVIEW: "bg-warning-100 text-warning-700",
      MORE_INFORMATION_REQUIRED: "bg-error-100 text-error-700",
      APPROVED: "bg-success-100 text-success-700",
      REJECTED: "bg-error-100 text-error-700",
      SUSPENDED: "bg-neutral-100 text-neutral-700",
    };
    return colors[status ?? "DRAFT"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-kampmax-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-kampmax-bg flex items-center justify-center px-6">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl border border-kampmax-border">
          <Wrench className="mx-auto h-12 w-12 text-kampmax-text-secondary mb-4" />
          <h1 className="text-xl font-bold text-kampmax-text mb-2">No Service Provider Profile</h1>
          <p className="text-kampmax-text-secondary mb-6">
            You haven't created a Service Provider profile yet.
          </p>
          <Button className="w-full" onClick={() => router.push("/onboarding/service-provider/1")}>
            <Wrench className="h-4 w-4 mr-2" />
            Create Service Provider Profile
          </Button>
        </div>
      </div>
    );
  }

  if (!summary.hasServiceProviderProfile || summary.status === "DRAFT" || summary.status === "IN_PROGRESS") {
    return (
      <div className="min-h-screen bg-kampmax-bg px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-kampmax-text">Service Provider Dashboard</h1>
            <p className="mt-1 text-kampmax-text-secondary">
              Your application is currently in progress.
            </p>
          </div>

          <div className="rounded-xl border border-kampmax-border bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <Wrench className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-kampmax-text">
                  {summary.displayName || "Service Provider Application"}
                </h2>
                <span className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium", getStatusColor(summary.status))}>
                  {getStatusLabel(summary.status)}
                </span>
              </div>
            </div>
            <p className="text-kampmax-text-secondary mb-4">
              {summary.status === "DRAFT" && "Your application is saved as a draft. Continue where you left off."}
              {summary.status === "IN_PROGRESS" && "Your application is in progress. Continue to complete it."}
            </p>
            <Button className="w-full sm:w-auto" onClick={() => router.push("/onboarding/service-provider/1")}>
              <Wrench className="h-4 w-4 mr-2" />
              Continue Application
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Approved/Active provider dashboard
  if (summary.status === "APPROVED" && profile) {
    return (
      <div className="min-h-screen bg-kampmax-bg px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-kampmax-text">Service Provider Dashboard</h1>
              <p className="mt-1 text-kampmax-text-secondary">Manage your services and profile</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/onboarding/service-provider/1")}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="primary" onClick={() => router.push("/service-provider/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>
          </div>

          {/* Profile Overview */}
          <div className="rounded-xl border border-kampmax-border bg-white p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-shrink-0 lg:w-48">
                {profile.logo ? (
                  <img src={profile.logo} alt={profile.displayName} className="w-48 h-48 rounded-xl object-cover" />
                ) : (
                  <div className="w-48 h-48 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Wrench className="h-16 w-16 text-primary-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-2xl font-bold text-kampmax-text truncate">{profile.displayName}</h2>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-700">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    </div>
                    {profile.tagline && (
                      <p className="mt-1 text-lg text-kampmax-text-secondary">{profile.tagline}</p>
                    )}
                    <p className="mt-2 text-kampmax-text-secondary line-clamp-2">{profile.description}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-kampmax-text-secondary">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location?.primaryCampusId?.toUpperCase()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {profile.rating} ({profile.totalBookings} bookings)
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button variant="outline" onClick={() => router.push(`/service-provider/${profile.slug}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Public Profile
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/onboarding/service-provider/1")}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Services" value={profile.services.length} icon={Settings} color="primary" />
              <StatCard label="Total Bookings" value={profile.totalBookings} icon={Calendar} color="gold" />
              <StatCard label="Rating" value={profile.rating.toFixed(1)} icon={Star} color="success" />
              <StatCard label="Response Time" value={profile.responseTime || "—"} icon={Calendar} color="info" />
            </div>

            {/* Services */}
            <div className="rounded-xl border border-kampmax-border bg-white">
              <div className="p-6 border-b border-kampmax-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-kampmax-text">Your Services</h2>
                <Button variant="primary" size="sm" onClick={() => router.push("/service-provider/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>
              <div className="divide-y divide-kampmax-border">
                {profile.services.length === 0 ? (
                  <div className="p-12 text-center">
                    <Settings className="mx-auto h-12 w-12 text-kampmax-text-secondary mb-4" />
                    <h3 className="text-lg font-medium text-kampmax-text mb-1">No services yet</h3>
                    <p className="text-kampmax-text-secondary mb-4">Add your first service to start getting bookings.</p>
                    <Button onClick={() => router.push("/service-provider/new")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Service
                    </Button>
                  </div>
                ) : (
                  <>
                    {profile.services.map((service) => (
                      <div key={service.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-kampmax-text">{service.name}</h3>
                          <p className="mt-1 text-sm text-kampmax-text-secondary line-clamp-1">{service.description}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                              <DollarSign className="h-3 w-3" />
                              {service.pricingModel === "fixed" ? `${formatNaira(service.price)}` :
                               service.pricingModel === "starting_from" ? `From ${formatNaira(service.price)}` :
                               service.pricingModel === "range" ? `${formatNaira(service.price)} - ${formatNaira(service.priceMax || service.price)}` :
                               "Quote Required"}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                              <Clock className="h-3 w-3" />
                              {service.durationMinutes} min
                            </span>
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                              SERVICE_STATUS_COLORS[service.status]
                            )}>
                              {SERVICE_STATUS_LABELS[service.status] || service.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/service-provider/${profile.slug}/services/${service.id}/edit`)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <QuickLink
                icon={Plus}
                title="Add Service"
                description="Create a new service listing"
                onClick={() => router.push("/service-provider/new")}
              />
              <QuickLink
                icon={Calendar}
                title="Manage Availability"
                description="Update your schedule and booking preferences"
                onClick={() => router.push("/onboarding/service-provider/6")}
              />
              <QuickLink
                icon={MapPin}
                title="Service Areas"
                description="Update campuses and cities you serve"
                onClick={() => router.push("/onboarding/service-provider/5")}
              />
              <QuickLink
                icon={Image}
                title="Update Portfolio"
                description="Add or remove portfolio items"
                onClick={() => router.push("/onboarding/service-provider/8")}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rejected/Suspended
  return (
    <div className="min-h-screen bg-kampmax-bg px-6 py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="rounded-xl border border-kampmax-border bg-white p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-error-600 mb-4" />
          <h1 className="text-xl font-bold text-kampmax-text mb-2">
            {summary.status === "REJECTED" ? "Application Rejected" : "Profile Suspended"}
          </h1>
          <p className="text-kampmax-text-secondary mb-6">
            {summary.status === "REJECTED"
              ? "Your application was not approved. Please check your email for details and try again."
              : "Your service provider profile has been suspended. Contact support for more information."}
          </p>
          <Button className="w-full" onClick={() => router.push("/onboarding/service-provider/1")}>
            {summary.status === "REJECTED" ? "Re-apply" : "Contact Support"}
          </Button>
        </div>
      </div>
      </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; color: "primary" | "gold" | "success" | "info" }) {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-600",
    gold: "bg-yellow-100 text-yellow-600",
    success: "bg-success-100 text-success-600",
    info: "bg-info-100 text-info-600",
  };
  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-kampmax-text-secondary">{label}</p>
          <p className="mt-1 text-2xl font-bold text-kampmax-text">{value}</p>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ icon: Icon, title, description, onClick }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-kampmax-border bg-white p-6 text-left hover:border-primary-300 hover:shadow-md transition-all"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-kampmax-text mb-1">{title}</h3>
      <p className="text-sm text-kampmax-text-secondary">{description}</p>
    </button>
  );
}