"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { PostCard } from "@/components/community/PostCard";
import { CommentSection } from "@/components/community/CommentSection";
import { useAuth } from "@/lib/auth-context";
import {
  getCampusPostById,
  getCommentsByPost,
} from "@/services/posts";
import {
  ArrowLeft,
  Flag,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { reportPost, deletePost } from "@/services/posts";
import { ReportReason } from "@/types";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reported, setReported] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const post = getCampusPostById(id);
  const comments = post ? getCommentsByPost(id) : [];

  if (!post || deleted) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm text-kampmax-text-secondary">
            {deleted ? "Post deleted" : "Post not found"}
          </p>
          <button
            onClick={() => router.push("/community")}
            className="mt-3 text-sm text-kampmax-blue font-medium"
          >
            Back to feed
          </button>
        </div>
      </PageContainer>
    );
  }

  function handleReport() {
    reportPost(id, user!.id, reportReason, reportDetails || undefined);
    setReported(true);
    setShowReportModal(false);
  }

  function handleDelete() {
    deletePost(id);
    setDeleted(true);
    router.push("/community");
  }

  const isOwner = user?.id === post.userId;

  return (
    <PageContainer className="space-y-4">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-kampmax-text-secondary hover:text-kampmax-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Post */}
      <PostCard post={post} />

      {/* Owner actions */}
      {isOwner && (
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-kampmax-error bg-kampmax-error/10 hover:bg-kampmax-error/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Post
          </button>
        </div>
      )}

      {/* Report button */}
      {!isOwner && !reported && (
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-1.5 text-xs text-kampmax-text-secondary hover:text-kampmax-error"
        >
          <Flag className="h-3.5 w-3.5" />
          Report post
        </button>
      )}
      {reported && (
        <div className="flex items-center gap-1.5 text-xs text-kampmax-success">
          <AlertTriangle className="h-3.5 w-3.5" />
          Thank you for reporting. We'll review this post.
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <h3 className="text-sm font-bold text-kampmax-text mb-4">
          Comments ({comments.length})
        </h3>
        <CommentSection postId={id} comments={comments} />
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-5 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-kampmax-text mb-4">
              Report Post
            </h3>

            <div className="space-y-2 mb-4">
              {(
                [
                  "spam",
                  "inappropriate",
                  "scam",
                  "harassment",
                  "other",
                ] as ReportReason[]
              ).map((reason) => (
                <label
                  key={reason}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    reportReason === reason
                      ? "border-kampmax-blue bg-kampmax-blue/5"
                      : "border-kampmax-border"
                  )}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value as ReportReason)}
                    className="w-4 h-4 text-kampmax-blue accent-kampmax-blue"
                  />
                  <span className="text-sm capitalize text-kampmax-text">
                    {reason.replace("_", " ")}
                  </span>
                </label>
              ))}
            </div>

            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Additional details (optional)"
              rows={3}
              className="w-full rounded-lg border border-kampmax-border px-3 py-2 text-sm mb-4 focus:outline-none focus:border-kampmax-blue resize-none"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-kampmax-border text-sm font-medium text-kampmax-text-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="flex-1 py-2.5 rounded-lg bg-kampmax-error/100 text-white text-sm font-semibold"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
