"use client";

import { useState } from "react";
import { X, Camera, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";
import { addReview } from "@/services/reviews";
import { useAuth } from "@/lib/auth-context";

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  target: "product" | "vendor";
  vendorId?: string;
  productId?: string;
  orderId?: string;
  onSuccess?: () => void;
}

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export function ReviewForm({
  isOpen,
  onClose,
  targetId,
  target,
  vendorId,
  productId,
  orderId,
  onSuccess,
}: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  function handleSubmit() {
    if (!user || rating === 0 || comment.trim().length < 10) return;

    addReview({
      targetId,
      target,
      userId: user.id,
      rating,
      title: title.trim() || undefined,
      comment: comment.trim(),
      vendorId,
      productId,
      orderId,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setTitle("");
      setComment("");
      onClose();
      onSuccess?.();
    }, 1500);
  }

  const isValid = rating > 0 && comment.trim().length >= 10;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl flex flex-col max-h-[85vh]">
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-kampmax-border">
          <h2 className="text-sm font-bold text-kampmax-text">
            Write a Review
          </h2>
          <button
            onClick={() => {
              setRating(0);
              setTitle("");
              setComment("");
              onClose();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-kampmax-text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-sm font-semibold text-kampmax-text">Review Submitted!</p>
            <p className="text-xs text-kampmax-text-secondary mt-1">
              Thank you for your feedback
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Rating */}
            <div className="text-center">
              <p className="text-sm font-medium text-kampmax-text mb-3">
                How would you rate this {target}?
              </p>
              <div className="flex justify-center">
                <StarRating rating={rating} size="lg" interactive onChange={setRating} />
              </div>
              {rating > 0 && (
                <p className="text-xs text-kampmax-blue font-medium mt-2">
                  {ratingLabels[rating]}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
                Review title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                maxLength={80}
                className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
                Your review *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details about your experience..."
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20 resize-none"
              />
              <div className="flex justify-between mt-1">
                <span className={cn(
                  "text-[10px]",
                  comment.length > 0 && comment.length < 10
                    ? "text-kampmax-error"
                    : "text-kampmax-text-secondary"
                )}>
                  {comment.length > 0 && comment.length < 10
                    ? `${10 - comment.length} more characters needed`
                    : "Minimum 10 characters"}
                </span>
                <span className="text-[10px] text-kampmax-text-secondary">
                  {comment.length}/500
                </span>
              </div>
            </div>

            {/* Image upload placeholder */}
            <div>
              <p className="text-xs font-medium text-kampmax-text-secondary mb-1.5">
                Add photos (optional)
              </p>
              <button className="w-20 h-20 rounded-lg border-2 border-dashed border-kampmax-border flex flex-col items-center justify-center gap-1 text-kampmax-text-secondary hover:border-kampmax-blue hover:text-kampmax-blue transition-colors">
                <Camera className="h-5 w-5" />
                <span className="text-[10px]">Add Photo</span>
              </button>
              <p className="text-[10px] text-kampmax-text-secondary mt-1">
                JPG, PNG up to 5MB. Max 5 photos.
              </p>
            </div>
          </div>
        )}

        {!submitted && (
          <div className="shrink-0 border-t border-kampmax-border px-4 py-3">
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={cn(
                "w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors",
                isValid
                  ? "bg-kampmax-blue text-white hover:bg-kampmax-blue-dark"
                  : "bg-kampmax-muted text-kampmax-text-secondary cursor-not-allowed"
              )}
            >
              <Send className="h-4 w-4" />
              Submit Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
