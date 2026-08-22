"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuth } from "@/lib/auth-context";
import { useApp } from "@/lib/app-context";
import { createPost } from "@/services/posts";
import { PostType } from "@/types";
import {
  ArrowLeft,
  MessageCircle,
  ShoppingCart,
  CalendarDays,
  Search,
  Megaphone,
  BarChart3,
  ImageIcon,
  X,
  Plus,
  MapPin,
  AlertTriangle,
  Tag,
} from "lucide-react";

type Step = "type" | "form" | "preview";

const postTypes: {
  id: PostType;
  label: string;
  description: string;
  icon: typeof MessageCircle;
  color: string;
}[] = [
  {
    id: "discussion",
    label: "Discussion",
    description: "Start a campus conversation",
    icon: MessageCircle,
    color: "text-kampmax-blue",
  },
  {
    id: "question",
    label: "Question",
    description: "Ask the campus community",
    icon: Search,
    color: "text-kampmax-gold",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    description: "Buy, sell, or trade",
    icon: ShoppingCart,
    color: "text-kampmax-blue",
  },
  {
    id: "event",
    label: "Event",
    description: "Share an event or meetup",
    icon: CalendarDays,
    color: "text-kampmax-success",
  },
  {
    id: "poll",
    label: "Poll",
    description: "Get the campus vote",
    icon: BarChart3,
    color: "text-kampmax-navy",
  },
  {
    id: "announcement",
    label: "Announcement",
    description: "Important campus info",
    icon: Megaphone,
    color: "text-kampmax-error",
  },
  {
    id: "lost_found",
    label: "Lost & Found",
    description: "Report or find lost items",
    icon: AlertTriangle,
    color: "text-kampmax-warning",
  },
  {
    id: "image",
    label: "Photo",
    description: "Share a campus moment",
    icon: ImageIcon,
    color: "text-kampmax-info",
  },
];

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedCampus } = useApp();

  const [step, setStep] = useState<Step>("type");
  const [postType, setPostType] = useState<PostType>("discussion");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Poll fields
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDuration, setPollDuration] = useState(7);

  // Announcement fields
  const [announcementPriority, setAnnouncementPriority] = useState<"info" | "warning" | "urgent">("info");

  // Lost & Found fields
  const [lostItem, setLostItem] = useState("");
  const [lostLocation, setLostLocation] = useState("");
  const [lostContact, setLostContact] = useState("");
  const [lostStatus, setLostStatus] = useState<"lost" | "found">("lost");

  if (!user) return null;

  const campusId = selectedCampus?.id || "rugipo";

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handlePublish() {
    const postData: Parameters<typeof createPost>[0] = {
      userId: user!.id,
      campusId,
      type: postType,
      title: title.trim(),
      content: content.trim(),
      tags: tags.length > 0 ? tags : undefined,
      isLiked: false,
    };

    // Add type-specific data
    if (postType === "poll" && pollQuestion.trim()) {
      const validOptions = pollOptions.filter((o) => o.trim());
      postData.poll = {
        id: `pol${Date.now()}`,
        question: pollQuestion.trim(),
        options: validOptions.map((text, i) => ({
          id: `po${Date.now()}_${i}`,
          text: text.trim(),
          votes: [],
        })),
        totalVotes: 0,
        endsAt: new Date(
          Date.now() + pollDuration * 86400000
        ).toISOString(),
        isAnonymous: false,
      };
      postData.title = pollQuestion.trim();
    }

    if (postType === "announcement") {
      postData.announcement = {
        id: `ann${Date.now()}`,
        campusId,
        title: title.trim(),
        content: content.trim(),
        authorId: user!.id,
        priority: announcementPriority,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      };
    }

    if (postType === "lost_found") {
      postData.lostFound = {
        id: `lf${Date.now()}`,
        status: "open",
        itemDescription: lostItem.trim(),
        location: lostLocation.trim(),
        dateReported: new Date().toISOString().split("T")[0],
        contactInfo: lostContact.trim() || "DM me",
      };
    }

    createPost(postData);
    router.push("/community");
  }

  const isValid =
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    (postType !== "poll" || pollOptions.filter((o) => o.trim()).length >= 2);

  return (
    <PageContainer className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            step === "type" ? router.back() : setStep(step === "preview" ? "form" : "type")
          }
          className="flex items-center gap-2 text-sm text-kampmax-text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === "type" ? "Back" : "Previous"}
        </button>
        <h1 className="text-base font-bold text-kampmax-text">
          {step === "type"
            ? "New Post"
            : step === "form"
              ? "Create Post"
              : "Preview"}
        </h1>
        {step === "form" && (
          <button
            onClick={handlePublish}
            disabled={!isValid}
            className={cn(
              "text-sm font-semibold",
              isValid ? "text-kampmax-blue" : "text-kampmax-text-secondary/50"
            )}
          >
            Post
          </button>
        )}
        {step === "type" && <div />}
      </div>

      {/* Step: Type Selection */}
      {step === "type" && (
        <div className="space-y-2">
          <p className="text-xs text-kampmax-text-secondary mb-3">
            What would you like to share with RUGIPO?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {postTypes.map((pt) => {
              const Icon = pt.icon;
              return (
                <button
                  key={pt.id}
                  onClick={() => {
                    setPostType(pt.id);
                    setStep("form");
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-kampmax-border bg-white text-left hover:border-kampmax-blue transition-colors"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      pt.color,
                      "bg-kampmax-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-kampmax-text">
                      {pt.label}
                    </p>
                    <p className="text-[10px] text-kampmax-text-secondary">
                      {pt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step: Form */}
      {step === "form" && (
        <div className="space-y-4">
          {/* Post Type Badge */}
          <div className="flex items-center gap-2">
            {(() => {
              const pt = postTypes.find((p) => p.id === postType)!;
              const Icon = pt.icon;
              return (
                <>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-kampmax-muted",
                      pt.color
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {pt.label}
                  </span>
                </>
              );
            })()}
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your post a title..."
            className="w-full text-lg font-bold text-kampmax-text placeholder:text-kampmax-text-secondary/40 focus:outline-none bg-transparent border-b border-kampmax-border pb-2"
          />

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={6}
            className="w-full text-sm text-kampmax-text placeholder:text-kampmax-text-secondary/40 focus:outline-none bg-white border border-kampmax-border rounded-xl p-4 resize-none"
          />

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-3.5 w-3.5 text-kampmax-text-secondary" />
              <span className="text-xs font-medium text-kampmax-text-secondary">
                Tags (optional, max 5)
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 bg-kampmax-muted/50 rounded-lg px-3 py-2 text-sm border border-kampmax-border focus:outline-none focus:border-kampmax-blue"
              />
              <button
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 5}
                className="px-3 py-2 rounded-lg bg-kampmax-muted text-kampmax-text-secondary text-xs font-medium"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-kampmax-blue/10 text-kampmax-blue"
                  >
                    #{tag}
                    <button onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Poll-specific fields */}
          {postType === "poll" && (
            <div className="space-y-3 p-4 rounded-xl border border-kampmax-border bg-kampmax-muted/30">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-kampmax-navy" />
                <span className="text-sm font-semibold text-kampmax-text">
                  Poll Settings
                </span>
              </div>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Your poll question..."
                className="w-full bg-white rounded-lg px-3 py-2.5 text-sm border border-kampmax-border focus:outline-none focus:border-kampmax-blue"
              />
              <div className="space-y-2">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollOptions];
                        newOpts[i] = e.target.value;
                        setPollOptions(newOpts);
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 bg-white rounded-lg px-3 py-2.5 text-sm border border-kampmax-border focus:outline-none focus:border-kampmax-blue"
                    />
                    {i >= 2 && (
                      <button
                        onClick={() =>
                          setPollOptions(pollOptions.filter((_, j) => j !== i))
                        }
                        className="text-kampmax-text-secondary hover:text-kampmax-error"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 6 && (
                <button
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  className="flex items-center gap-1 text-xs text-kampmax-blue font-medium"
                >
                  <Plus className="h-3.5 w-3.5" /> Add option
                </button>
              )}
              <select
                value={pollDuration}
                onChange={(e) => setPollDuration(Number(e.target.value))}
                className="w-full bg-white rounded-lg px-3 py-2.5 text-sm border border-kampmax-border focus:outline-none focus:border-kampmax-blue"
              >
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
          )}

          {/* Announcement-specific fields */}
          {postType === "announcement" && (
            <div className="space-y-3 p-4 rounded-xl border border-kampmax-border bg-kampmax-muted/30">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-kampmax-error" />
                <span className="text-sm font-semibold text-kampmax-text">
                  Announcement Priority
                </span>
              </div>
              <div className="flex gap-2">
                {(["info", "warning", "urgent"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setAnnouncementPriority(p)}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg text-xs font-semibold capitalize transition-colors",
                      announcementPriority === p
                        ? p === "urgent"
                          ? "bg-kampmax-error/100 text-white"
                          : p === "warning"
                            ? "bg-kampmax-gold text-kampmax-navy"
                            : "bg-kampmax-blue text-white"
                        : "bg-white border border-kampmax-border text-kampmax-text-secondary"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lost & Found fields */}
          {postType === "lost_found" && (
            <div className="space-y-3 p-4 rounded-xl border border-kampmax-border bg-kampmax-muted/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-kampmax-warning" />
                <span className="text-sm font-semibold text-kampmax-text">
                  Lost & Found Details
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setLostStatus("lost")}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors",
                    lostStatus === "lost"
                      ? "bg-kampmax-error text-white"
                      : "bg-white border border-kampmax-border text-kampmax-text-secondary"
                  )}
                >
                  Lost
                </button>
                <button
                  onClick={() => setLostStatus("found")}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors",
                    lostStatus === "found"
                      ? "bg-kampmax-success text-white"
                      : "bg-white border border-kampmax-border text-kampmax-text-secondary"
                  )}
                >
                  Found
                </button>
              </div>
              <input
                type="text"
                value={lostItem}
                onChange={(e) => setLostItem(e.target.value)}
                placeholder="Describe the item..."
                className="w-full bg-white rounded-lg px-3 py-2.5 text-sm border border-kampmax-border focus:outline-none focus:border-kampmax-blue"
              />
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-kampmax-text-secondary" />
                  <input
                    type="text"
                    value={lostLocation}
                    onChange={(e) => setLostLocation(e.target.value)}
                    placeholder="Location"
                    className="w-full bg-white rounded-lg pl-8 pr-3 py-2.5 text-sm border border-kampmax-border focus:outline-none focus:border-kampmax-blue"
                  />
                </div>
              </div>
              <input
                type="text"
                value={lostContact}
                onChange={(e) => setLostContact(e.target.value)}
                placeholder="Contact info (optional)"
                className="w-full bg-white rounded-lg px-3 py-2.5 text-sm border border-kampmax-border focus:outline-none focus:border-kampmax-blue"
              />
            </div>
          )}

          {/* Image placeholder */}
          {postType === "image" && (
            <div className="border-2 border-dashed border-kampmax-border rounded-xl p-8 text-center">
              <ImageIcon className="h-8 w-8 text-kampmax-text-secondary/30 mx-auto mb-2" />
              <p className="text-xs text-kampmax-text-secondary">
                Image upload (mock)
              </p>
              <p className="text-[10px] text-kampmax-text-secondary/60 mt-1">
                Photos will appear in your post
              </p>
            </div>
          )}

          {/* Preview button */}
          <button
            onClick={() => setStep("preview")}
            disabled={!isValid}
            className={cn(
              "w-full py-3 rounded-xl text-sm font-semibold transition-colors",
              isValid
                ? "bg-kampmax-navy text-white"
                : "bg-kampmax-muted text-kampmax-text-secondary"
            )}
          >
            Preview Post
          </button>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-kampmax-border bg-white p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-kampmax-navy text-white flex items-center justify-center text-sm font-bold">
                {user.name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-kampmax-text">
                  {user.name}
                </p>
                <p className="text-[10px] text-kampmax-text-secondary">
                  Just now · RUGIPO
                </p>
              </div>
            </div>
            <h3 className="text-base font-bold text-kampmax-text mb-2">
              {title}
            </h3>
            <p className="text-sm text-kampmax-text-secondary leading-relaxed whitespace-pre-line">
              {content}
            </p>
            {tags.length > 0 && (
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-kampmax-muted text-kampmax-text-secondary font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handlePublish}
            className="w-full py-3 rounded-xl bg-kampmax-blue text-white text-sm font-semibold"
          >
            Publish to RUGIPO
          </button>
        </div>
      )}
    </PageContainer>
  );
}
