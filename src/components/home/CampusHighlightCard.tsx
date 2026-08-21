import Link from "next/link";
import { MessageCircle, Heart, Tag } from "lucide-react";
import { CampusPost } from "@/types";
import { getUserById } from "@/services/users";
import { Avatar } from "@/components/ui";
import { timeAgo, cn } from "@/lib/utils";

interface CampusHighlightCardProps {
  post: CampusPost;
  className?: string;
}

const typeConfig: Record<string, { label: string; color: string }> = {
  discussion: { label: "Discussion", color: "bg-blue-50 text-kampmax-blue" },
  question: { label: "Question", color: "bg-amber-50 text-kampmax-gold-dark" },
  event: { label: "Event", color: "bg-green-50 text-kampmax-success" },
  marketplace: { label: "Marketplace", color: "bg-purple-50 text-purple-600" },
  poll: { label: "Poll", color: "bg-purple-50 text-purple-600" },
  announcement: { label: "Announcement", color: "bg-red-50 text-red-600" },
  lost_found: { label: "Lost & Found", color: "bg-orange-50 text-orange-600" },
  image: { label: "Photo", color: "bg-pink-50 text-pink-600" },
};

export function CampusHighlightCard({ post, className }: CampusHighlightCardProps) {
  const author = getUserById(post.userId);
  const config = typeConfig[post.type];

  return (
    <Link
      href={`/community/${post.id}`}
      className={cn(
        "flex-shrink-0 w-[280px] bg-white rounded-lg border border-kampmax-border p-3",
        "hover:border-kampmax-blue/50 hover:shadow-sm transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Avatar name={author?.name || "User"} size="sm" />
        <div className="min-w-0 flex-1">
          <span className="text-xs font-medium text-kampmax-text truncate block">
            {author?.name}
          </span>
          <span className="text-[10px] text-kampmax-text-secondary">
            {timeAgo(post.createdAt)}
          </span>
        </div>
        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", config.color)}>
          {config.label}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-kampmax-text line-clamp-2 leading-tight mb-1.5">
        {post.title}
      </h3>
      <p className="text-xs text-kampmax-text-secondary line-clamp-2 mb-2">
        {post.content}
      </p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs text-kampmax-text-secondary">
          <Heart className={cn("h-3 w-3", post.isLiked && "fill-kampmax-error text-kampmax-error")} />
          <span>{post.likes}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-kampmax-text-secondary">
          <MessageCircle className="h-3 w-3" />
          <span>{post.commentCount}</span>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-kampmax-text-secondary ml-auto">
            <Tag className="h-3 w-3" />
            <span>{post.tags[0]}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
