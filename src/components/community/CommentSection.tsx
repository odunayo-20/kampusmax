"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Comment } from "@/types";
import { getUserById } from "@/services/users";
import {
  addComment,
  toggleCommentLike,
  deleteComment,
} from "@/services/posts";
import { useAuth } from "@/lib/auth-context";
import {
  Heart,
  Trash2,
  MessageCircle,
  Send,
} from "lucide-react";

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onCommentAdded?: (comment: Comment) => void;
}

export function CommentSection({ postId, comments: initialComments, onCommentAdded }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [showAll, setShowAll] = useState(false);

  if (!user) return null;

  const displayedComments = showAll ? comments : comments.slice(0, 3);

  function handleSubmit() {
    if (!text.trim()) return;
    const newComment = addComment({
      postId,
      userId: user!.id,
      text: text.trim(),
    });
    setComments([...comments, newComment]);
    setText("");
    onCommentAdded?.(newComment);
  }

  function handleLike(commentId: string) {
    toggleCommentLike(commentId);
    setComments(
      comments.map((c) =>
        c.id === commentId
          ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
  }

  function handleDelete(commentId: string) {
    deleteComment(commentId);
    setComments(comments.filter((c) => c.id !== commentId));
  }

  return (
    <div className="space-y-3">
      {/* Comment List */}
      {displayedComments.length > 0 ? (
        <div className="space-y-3">
          {displayedComments.map((comment) => {
            const author = getUserById(comment.userId);
            return (
              <div key={comment.id} className="flex gap-2.5">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-kampmax-navy/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-kampmax-navy">
                  {author?.name?.charAt(0) || "?"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-kampmax-muted/50 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-kampmax-text">
                        {author?.name || "Unknown"}
                      </span>
                      <span className="text-[9px] text-kampmax-text-secondary">
                        {new Date(comment.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-kampmax-text leading-relaxed">
                      {comment.text}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-1 px-1">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={cn(
                        "flex items-center gap-1 text-[10px] font-medium transition-colors",
                        comment.isLiked ? "text-kampmax-blue" : "text-kampmax-text-secondary/60"
                      )}
                    >
                      <Heart
                        className={cn("h-3 w-3", comment.isLiked && "fill-kampmax-blue")}
                      />
                      {comment.likes > 0 && comment.likes}
                    </button>
                    {comment.userId === user.id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="flex items-center gap-1 text-[10px] text-kampmax-text-secondary/60 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4">
          <MessageCircle className="h-6 w-6 text-kampmax-text-secondary/30 mx-auto mb-1" />
          <p className="text-xs text-kampmax-text-secondary">No comments yet</p>
        </div>
      )}

      {/* Show more */}
      {!showAll && comments.length > 3 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs font-medium text-kampmax-blue"
        >
          View all {comments.length} comments
        </button>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-2 border-t border-kampmax-border">
        <div className="w-8 h-8 rounded-full bg-kampmax-navy text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
          {user.name?.charAt(0) || "?"}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Write a comment..."
            className="flex-1 bg-kampmax-muted/50 rounded-xl px-3 py-2 text-sm border border-kampmax-border focus:outline-none focus:border-kampmax-blue"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
              text.trim()
                ? "bg-kampmax-blue text-white"
                : "bg-kampmax-muted text-kampmax-text-secondary"
            )}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
