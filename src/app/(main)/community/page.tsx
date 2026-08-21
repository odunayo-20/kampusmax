"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { PostCard } from "@/components/community/PostCard";
import { CommunityEventCard } from "@/components/community/EventCard";
import { CampusAnnouncementCard } from "@/components/community/CampusAnnouncement";
import { useAuth } from "@/lib/auth-context";
import { useApp } from "@/lib/app-context";
import { getCampusPosts } from "@/services/posts";
import { getUpcomingEvents, attendEvent, unattendEvent } from "@/services/events";
import {
  Plus,
  MessageCircle,
  CalendarDays,
  Megaphone,
  Search,
  X,
  TrendingUp,
  Filter,
} from "lucide-react";

type FeedTab = "all" | "discussions" | "marketplace" | "events" | "lost_found" | "announcements";

const feedTabs: { id: FeedTab; label: string; icon: typeof MessageCircle }[] = [
  { id: "all", label: "All", icon: TrendingUp },
  { id: "discussions", label: "Discussions", icon: MessageCircle },
  { id: "marketplace", label: "Marketplace", icon: Filter },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "lost_found", label: "Lost & Found", icon: Search },
  { id: "announcements", label: "Alerts", icon: Megaphone },
];

export default function CommunityFeedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedCampus } = useApp();
  const [activeTab, setActiveTab] = useState<FeedTab>("all");
  const [search, setSearch] = useState("");

  if (!user) return null;

  const campusId = selectedCampus?.id || "rugipo";
  const allPosts = getCampusPosts(campusId);
  const upcomingEvents = getUpcomingEvents(campusId);

  // Get announcements from posts
  const announcements = allPosts
    .filter((p) => p.type === "announcement" && p.announcement)
    .map((p) => p.announcement!);

  // Filter posts
  const filteredPosts = allPosts.filter((p) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "discussions" &&
        ["discussion", "question", "poll", "image"].includes(p.type)) ||
      (activeTab === "marketplace" && p.type === "marketplace") ||
      (activeTab === "events" && p.type === "event") ||
      (activeTab === "lost_found" && p.type === "lost_found") ||
      (activeTab === "announcements" && p.type === "announcement");
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const tabCounts = {
    all: allPosts.length,
    discussions: allPosts.filter((p) =>
      ["discussion", "question", "poll", "image"].includes(p.type)
    ).length,
    marketplace: allPosts.filter((p) => p.type === "marketplace").length,
    events: allPosts.filter((p) => p.type === "event").length,
    lost_found: allPosts.filter((p) => p.type === "lost_found").length,
    announcements: allPosts.filter((p) => p.type === "announcement").length,
  };

  return (
    <PageContainer className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-kampmax-text">Campus Community</h1>
          <p className="text-xs text-kampmax-text-secondary">
            RUGIPO · {allPosts.length} post{allPosts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => router.push("/community/create")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-kampmax-blue text-white text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          Post
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kampmax-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts, tags..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-kampmax-border text-sm bg-white focus:outline-none focus:border-kampmax-blue"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-kampmax-text-secondary" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
        {feedTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0",
                activeTab === tab.id
                  ? "bg-kampmax-navy text-white"
                  : "bg-white text-kampmax-text-secondary border border-kampmax-border"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              <span className={cn(
                "text-[10px] px-1 py-0 rounded-full",
                activeTab === tab.id ? "bg-white/20" : "bg-kampmax-muted"
              )}>
                {tabCounts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Announcements Banner */}
      {announcements.length > 0 && activeTab === "all" && (
        <div className="space-y-2">
          {announcements.slice(0, 2).map((ann) => (
            <CampusAnnouncementCard key={ann.id} announcement={ann} compact />
          ))}
        </div>
      )}

      {/* Upcoming Events Banner */}
      {upcomingEvents.length > 0 && (activeTab === "all" || activeTab === "events") && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-kampmax-text-secondary px-1">
            Upcoming Events
          </h2>
          {upcomingEvents.slice(0, 2).map((event) => (
            <CommunityEventCard
              key={event.id}
              event={event}
              compact
              isAttending={event.attendees.includes(user.id)}
              onAttend={() =>
                event.attendees.includes(user.id)
                  ? unattendEvent(event.id, user.id)
                  : attendEvent(event.id, user.id)
              }
            />
          ))}
        </div>
      )}

      {/* Feed */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl border border-kampmax-border p-12 text-center">
            <MessageCircle className="h-12 w-12 text-kampmax-text-secondary/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-kampmax-text">No posts found</p>
            <p className="text-xs text-kampmax-text-secondary mt-1">
              {search
                ? "Try a different search term"
                : "Be the first to post in this category!"}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </PageContainer>
  );
}
