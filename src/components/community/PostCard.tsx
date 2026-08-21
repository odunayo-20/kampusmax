"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CampusPost } from "@/types";
import { getUserById } from "@/services/users";
import { togglePostLike, toggleSavePost } from "@/services/posts";
import { PollCard } from "./PollCard";
import { CampusAnnouncementCard } from "./CampusAnnouncement";
import { CommunityEventCard } from "./EventCard";
import { votePoll } from "@/services/posts";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  Flag,
  Image as ImageIcon,
  ShoppingCart,
  MapPin,
  Search,
  AlertTriangle,
  Megaphone,
  CalendarDays,
  BarChart3,
  Package,
} from "lucide-react";

interface PostCardProps {
  post: CampusPost;
  onLike?: () => void;
  onSave?: () => void;
  onReport?: () => void;
}

const typeConfig: Record<
  string,
  { icon: typeof Heart; color: string; bg: string; label: string }
> = {
  discussion: {
    icon: MessageCircle,
    color: "text-kampmax-blue",
    bg: "bg-kampmax-blue/10",
    label: "Discussion",
  },
  question: {
    icon: Search,
    color: "text-kampmax-gold",
    bg: "bg-kampmax-gold/10",
    label: "Question",
  },
  event: {
    icon: CalendarDays,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Event",
  },
  marketplace: {
    icon: ShoppingCart,
    color: "text-kampmax-blue",
    bg: "bg-kampmax-blue/10",
    label: "Marketplace",
  },
  poll: {
    icon: BarChart3,
    color: "text-purple-600",
    bg: "bg-purple-50",
    label: "Poll",
  },
  announcement: {
    icon: Megaphone,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Announcement",
  },
  lost_found: {
    icon: Search,
    color: "text-orange-600",
    bg: "bg-orange-50",
    label: "Lost & Found",
  },
  image: {
    icon: ImageIcon,
    color: "text-pink-600",
    bg: "bg-pink-50",
    label: "Photo",
  },
};

export function PostCard({ post, onLike, onSave, onReport }: PostCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  const author = getUserById(localPost.userId);
  const config = typeConfig[localPost.type] || typeConfig.discussion;
  const TypeIcon = config.icon;

  function handleLike() {
    togglePostLike(localPost.id);
    setLocalPost((p) => ({
      ...p,
      likes: p.isLiked ? p.likes - 1 : p.likes + 1,
      isLiked: !p.isLiked,
    }));
    onLike?.();
  }

  function handleSave() {
    toggleSavePost(localPost.id, "u1");
    setLocalPost((p) => ({ ...p, isSaved: !p.isSaved }));
    onSave?.();
  }

  function handleVote(optionId: string) {
    votePoll(localPost.id, optionId, "u1");
    // Re-read the poll state
    setLocalPost((p) => {
      if (!p.poll) return p;
      const updated = { ...p.poll };
      updated.options = updated.options.map((o) => ({
        ...o,
        votes: o.id === optionId
          ? [...o.votes.filter((v) => v !== "u1"), "u1"]
          : o.votes.filter((v) => v !== "u1"),
      }));
      updated.totalVotes = updated.options.reduce(
        (sum, o) => sum + o.votes.length,
        0
      );
      return { ...p, poll: updated };
    });
  }

  function goToDetail() {
    router.push(`/community/${localPost.id}`);
  }

  return (
    <div className="bg-white rounded-xl border border-kampmax-border overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-kampmax-navy/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-kampmax-navy">
            {author?.name?.charAt(0) || "?"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-kampmax-text truncate">
                {author?.name || "Unknown"}
              </span>
              <span className="text-[10px] text-kampmax-text-secondary">
                {new Date(localPost.createdAt).toLocaleDateString("en-NG", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  config.bg,
                  config.color
                )}
              >
                <TypeIcon className="h-2.5 w-2.5" />
                {config.label}
              </span>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-kampmax-muted"
            >
              <MoreHorizontal className="h-4 w-4 text-kampmax-text-secondary" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 bg-white border border-kampmax-border rounded-xl shadow-lg z-20 py-1 min-w-[140px]">
                  <button
                    onClick={() => {
                      handleSave();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-kampmax-text hover:bg-kampmax-muted"
                  >
                    {localPost.isSaved ? (
                      <BookmarkCheck className="h-3.5 w-3.5 text-kampmax-blue" />
                    ) : (
                      <Bookmark className="h-3.5 w-3.5" />
                    )}
                    {localPost.isSaved ? "Unsave" : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      onReport?.();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <h3
          className="text-base font-bold text-kampmax-text mb-1 cursor-pointer hover:underline"
          onClick={goToDetail}
        >
          {localPost.title}
        </h3>
        <p className="text-sm text-kampmax-text-secondary leading-relaxed whitespace-pre-line">
          {localPost.content}
        </p>

        {/* Images placeholder */}
        {localPost.type === "image" && localPost.images && localPost.images.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
            {localPost.images.map((_, i) => (
              <div
                key={i}
                className="h-32 bg-kampmax-muted flex items-center justify-center"
              >
                <ImageIcon className="h-8 w-8 text-kampmax-text-secondary/30" />
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {localPost.tags && localPost.tags.length > 0 && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {localPost.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-kampmax-muted text-kampmax-text-secondary font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Lost & Found badge */}
        {localPost.type === "lost_found" && localPost.lostFound && (
          <div className="mt-3 rounded-lg bg-orange-50 border border-orange-200 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                {localPost.lostFound.status === "open" ? "Open" : localPost.lostFound.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-orange-600/60 text-[10px] font-medium">Item</span>
                <p className="text-kampmax-text">{localPost.lostFound.itemDescription}</p>
              </div>
              <div>
                <span className="text-orange-600/60 text-[10px] font-medium">Location</span>
                <p className="text-kampmax-text flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {localPost.lostFound.location}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Poll */}
      {localPost.type === "poll" && localPost.poll && (
        <div className="px-4 pb-3">
          <PollCard poll={localPost.poll} onVote={handleVote} compact />
        </div>
      )}

      {/* Embedded Announcement */}
      {localPost.type === "announcement" && localPost.announcement && (
        <div className="px-4 pb-3">
          <CampusAnnouncementCard announcement={localPost.announcement} compact />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2.5 border-t border-kampmax-border flex items-center gap-1">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            localPost.isLiked
              ? "text-kampmax-blue bg-kampmax-blue/10"
              : "text-kampmax-text-secondary hover:bg-kampmax-muted"
          )}
        >
          <Heart
            className={cn("h-4 w-4", localPost.isLiked && "fill-kampmax-blue")}
          />
          {localPost.likes}
        </button>

        <button
          onClick={goToDetail}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-kampmax-text-secondary hover:bg-kampmax-muted transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          {localPost.commentCount}
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-kampmax-text-secondary hover:bg-kampmax-muted transition-colors">
          <Share2 className="h-4 w-4" />
          Share
        </button>

        <div className="flex-1" />

        <button
          onClick={handleSave}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            localPost.isSaved
              ? "text-kampmax-blue"
              : "text-kampmax-text-secondary hover:bg-kampmax-muted"
          )}
        >
          {localPost.isSaved ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
