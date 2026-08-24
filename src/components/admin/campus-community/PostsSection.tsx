"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  Flag,
  EyeOff,
  RotateCcw,
  Search,
  ShieldOff,
  UserRound,
} from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { cn, formatDateShort, timeAgo } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import {
  POST_STATUS_FILTER_ORDER,
  POST_TYPE_FILTER_ORDER,
  postActionsFor,
  postTypeLabel,
  communityPostStatusLabel,
  communityPostStatusVariant,
} from "./campus-community-meta";
import { communityCampusName, previewText } from "./campus-community-utils";
import {
  AuthorCell,
  CommunitySectionShell,
  EngagementStats,
  RowMenu,
} from "./shared";
import { PostDetailDialog } from "./PostDetailDialog";
import { AuthorDialog } from "./AuthorDialog";
import { communityService } from "@/services/admin";
import type {
  CommunityAuthor,
  CommunityPost,
  CommunityPostStatus,
  CampusPostType,
  CommunitySectionCounts,
  Paginated,
} from "@/types/admin";

export interface CampusOption {
  id: string;
  name: string;
  shortName: string;
}

interface SectionBaseProps {
  campusOptions: CampusOption[];
  onToast: (tone: "success" | "error", text: string) => void;
}

type PendingAction =
  | { kind: "hide"; post: CommunityPost }
  | { kind: "restore"; post: CommunityPost }
  | { kind: "remove"; post: CommunityPost }
  | null;

export function PostsSection({ campusOptions, onToast }: SectionBaseProps) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput.trim(), 350);
  const [status, setStatus] = useState<CommunityPostStatus | "all">("all");
  const [type, setType] = useState<CampusPostType | "all">("all");
  const [campusId, setCampusId] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [list, setList] = useState<Paginated<CommunityPost> | null>(null);
  const [counts, setCounts] =
    useState<CommunitySectionCounts<CommunityPostStatus> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [author, setAuthor] = useState<CommunityAuthor | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [working, setWorking] = useState(false);

  const loadMeta = useCallback(async () => {
    try {
      setCounts(await communityService.getPostCounts());
    } catch {
      /* non-critical */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await communityService.listPosts({
        search: search || undefined,
        status,
        type,
        campusId,
        page,
        pageSize: 10,
      });
      setList(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, type, campusId, page]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  async function runModeration(action: NonNullable<PendingAction>) {
    setWorking(true);
    try {
      if (action.kind === "hide") {
        await communityService.setPostStatus(action.post.id, "hidden");
        onToast("success", `Post ${action.post.id.toUpperCase()} hidden from the feed.`);
      } else if (action.kind === "restore") {
        await communityService.setPostStatus(action.post.id, "published");
        onToast("success", `Post ${action.post.id.toUpperCase()} restored to the feed.`);
      } else {
        await communityService.setPostStatus(action.post.id, "removed");
        onToast("success", `Post ${action.post.id.toUpperCase()} removed for policy violation.`);
      }
      setPending(null);
      await Promise.all([loadList(), loadMeta()]);
    } catch (err) {
      onToast(
        "error",
        err instanceof Error ? err.message : "Couldn't update that post."
      );
    } finally {
      setWorking(false);
    }
  }

  const hasActiveFilters =
    searchInput.trim().length > 0 ||
    status !== "all" ||
    type !== "all" ||
    campusId !== "all";

  return (
    <>
      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter posts by status"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        {(["all", ...POST_STATUS_FILTER_ORDER] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={status === tab}
            onClick={() => {
              setStatus(tab);
              setPage(1);
            }}
            className={cn(
              "-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-1.5 text-[13px] font-medium transition-colors",
              status === tab
                ? "border-kampmax-blue text-kampmax-blue"
                : "border-transparent text-kampmax-text-secondary hover:text-kampmax-text"
            )}
          >
            {tab === "all" ? "All" : communityPostStatusLabel(tab)}
            {counts && (
              <span className="rounded-full bg-kampmax-muted px-1.5 py-px text-[10px] font-semibold tabular-nums">
                {tab === "all" ? counts.all : counts.byStatus[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="my-3 flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-64">
          <Input
            value={searchInput}
            placeholder="Search content or author…"
            leftIcon={<Search className="h-4 w-4" />}
            aria-label="Search posts"
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={type}
          aria-label="Filter by post type"
          onChange={(e) => {
            setType(e.target.value as CampusPostType | "all");
            setPage(1);
          }}
          className="w-auto h-9 text-xs"
        >
          <option value="all">All types</option>
          {POST_TYPE_FILTER_ORDER.map((t) => (
            <option key={t} value={t}>
              {postTypeLabel(t)}
            </option>
          ))}
        </Select>
        <Select
          value={campusId}
          aria-label="Filter by campus"
          onChange={(e) => {
            setCampusId(e.target.value);
            setPage(1);
          }}
          className="w-auto h-9 text-xs sm:max-w-44"
        >
          <option value="all">All campuses</option>
          {campusOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.shortName} - {c.name}
            </option>
          ))}
        </Select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setStatus("all");
              setType("all");
              setCampusId("all");
            }}
            className="text-xs font-medium text-kampmax-blue hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <CommunitySectionShell
        loading={loading && !list}
        error={error}
        isEmpty={(list?.items.length ?? 0) === 0}
        hasActiveFilters={hasActiveFilters}
        emptyTitle="No posts yet"
        emptyMessage="Campus posts will appear here as students publish to their feeds."
        onRetry={() => void loadList()}
        onClearFilters={() => {
          setSearchInput("");
          setStatus("all");
          setType("all");
          setCampusId("all");
        }}
      >
        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-lg border border-kampmax-border bg-white md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
                  <th scope="col" className="px-4 py-2.5 font-medium">Author</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Campus</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Content</th>
                  <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">Engagement</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Reports</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                  <th scope="col" className="hidden px-3 py-2.5 font-medium xl:table-cell">Created</th>
                  <th scope="col" className="w-10 px-2 py-2.5"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kampmax-border">
                {(list?.items ?? []).map((p) => {
                  const actions = postActionsFor(p);
                  return (
                    <tr
                      key={p.id}
                      className="cursor-pointer transition-colors hover:bg-kampmax-muted/40"
                      onClick={() => setDetailId(p.id)}
                    >
                      <td className="max-w-[170px] px-4 py-2.5">
                        <AuthorCell name={p.author.name} onViewAuthor={() => setAuthor(p.author)} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-kampmax-text-secondary">
                        {communityCampusName(p.campusId)}
                      </td>
                      <td className="max-w-[340px] px-3 py-2.5">
                        <p className="line-clamp-2 text-[13px] leading-snug text-kampmax-text">
                          {previewText(p.content, 120)}
                        </p>
                        <span className="mt-0.5 block text-[11px] capitalize text-kampmax-text-secondary">
                          {p.type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="hidden px-3 py-2.5 lg:table-cell">
                        <EngagementStats
                          likes={p.likeCount}
                          comments={p.commentCount}
                          shares={p.shareCount}
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        {p.reportsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 font-medium tabular-nums text-kampmax-error">
                            <Flag className="h-3 w-3" aria-hidden />
                            {p.reportsCount}
                          </span>
                        ) : (
                          <span className="text-kampmax-text-secondary">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge
                          variant={communityPostStatusVariant(p.status)}
                          label={communityPostStatusLabel(p.status)}
                        />
                      </td>
                      <td
                        className="hidden whitespace-nowrap px-3 py-2.5 tabular-nums text-kampmax-text-secondary xl:table-cell"
                        title={new Date(p.createdAt).toISOString()}
                      >
                        {formatDateShort(p.createdAt)}
                        <span className="ml-1.5 text-[11px]">{timeAgo(p.createdAt)}</span>
                      </td>
                      <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <RowMenu
                          label={`post ${p.id}`}
                          actions={[
                            {
                              key: "view",
                              label: "View post",
                              icon: Eye,
                              onSelect: () => setDetailId(p.id),
                            },
                            ...(actions.reviewReports
                              ? [
                                  {
                                    key: "reports",
                                    label: "Review reports",
                                    icon: Flag,
                                    onSelect: () => setDetailId(p.id),
                                  },
                                ]
                              : []),
                            ...(actions.hide
                              ? [
                                  {
                                    key: "hide",
                                    label: "Hide post",
                                    icon: EyeOff,
                                    onSelect: () => setPending({ kind: "hide", post: p }),
                                  },
                                ]
                              : []),
                            ...(actions.restore
                              ? [
                                  {
                                    key: "restore",
                                    label: "Restore post",
                                    icon: RotateCcw,
                                    onSelect: () => setPending({ kind: "restore", post: p }),
                                  },
                                ]
                              : []),
                            ...(actions.remove
                              ? [
                                  {
                                    key: "remove",
                                    label: "Remove post",
                                    icon: ShieldOff,
                                    danger: true,
                                    onSelect: () => setPending({ kind: "remove", post: p }),
                                  },
                                ]
                              : []),
                            {
                              key: "author",
                              label: "View author",
                              icon: UserRound,
                              onSelect: () => setAuthor(p.author),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <ul className="space-y-2.5 md:hidden">
          {(list?.items ?? []).map((p) => {
            const actions = postActionsFor(p);
            return (
              <li
                key={p.id}
                onClick={() => setDetailId(p.id)}
                className="cursor-pointer rounded-lg border border-kampmax-border bg-white p-3 transition-colors active:bg-kampmax-muted/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAuthor(p.author);
                      }}
                      className="truncate text-left text-sm font-medium text-kampmax-blue"
                    >
                      {p.author.name}
                    </button>
                    <span className="text-[11px] text-kampmax-text-secondary">
                      {communityCampusName(p.campusId)} · {timeAgo(p.createdAt)}
                    </span>
                  </div>
                  <StatusBadge
                    variant={communityPostStatusVariant(p.status)}
                    label={communityPostStatusLabel(p.status)}
                  />
                </div>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-kampmax-text">
                  {previewText(p.content, 140)}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 border-t border-dashed border-kampmax-border pt-2">
                  <EngagementStats
                    likes={p.likeCount}
                    comments={p.commentCount}
                    shares={p.shareCount}
                  />
                  {p.reportsCount > 0 && (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-kampmax-error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailId(p.id);
                      }}
                    >
                      <Flag className="h-3 w-3" aria-hidden />
                      {p.reportsCount} report{p.reportsCount === 1 ? "" : "s"}
                    </span>
                  )}
                  <div className="ml-auto flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {actions.hide && (
                      <button
                        type="button"
                        title="Hide post"
                        onClick={() => setPending({ kind: "hide", post: p })}
                        className="rounded-md p-1.5 text-amber-600 transition-colors hover:bg-amber-50"
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {actions.restore && (
                      <button
                        type="button"
                        title="Restore post"
                        onClick={() => setPending({ kind: "restore", post: p })}
                        className="rounded-md p-1.5 text-kampmax-success transition-colors hover:bg-emerald-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <RowMenu
                      label={`post ${p.id}`}
                      actions={[
                        {
                          key: "view",
                          label: "View post",
                          icon: Eye,
                          onSelect: () => setDetailId(p.id),
                        },
                        ...(actions.remove
                          ? [
                              {
                                key: "remove",
                                label: "Remove post",
                                icon: ShieldOff,
                                danger: true,
                                onSelect: () => setPending({ kind: "remove", post: p }),
                              },
                            ]
                          : []),
                        {
                          key: "author",
                          label: "View author",
                          icon: UserRound,
                          onSelect: () => setAuthor(p.author),
                        },
                      ]}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {list && list.totalPages > 1 && (
          <Pagination
            page={list.page}
            pageSize={list.pageSize}
            total={list.total}
            totalPages={list.totalPages}
            onPageChange={setPage}
            className="rounded-b-lg border border-t-0 border-kampmax-border bg-white"
          />
        )}
      </CommunitySectionShell>

      {/* View post / review reports */}
      <PostDetailDialog
        postId={detailId}
        onClose={() => setDetailId(null)}
        onViewAuthor={(a) => setAuthor(a)}
        onToast={onToast}
        onMutated={() => void Promise.all([loadList(), loadMeta()])}
      />

      {/* View author */}
      <AuthorDialog author={author} onClose={() => setAuthor(null)} />

      {/* Moderation confirmations */}
      <ConfirmDialog
        open={pending?.kind === "hide"}
        title={`Hide this post?`}
        message={
          pending?.kind === "hide"
            ? `The post disappears from ${communityCampusName(pending.post.campusId)}'s feed immediately but stays recoverable. The author keeps their post and can appeal.`
            : ""
        }
        confirmLabel="Hide post"
        tone="warning"
        loading={working}
        onConfirm={() => pending && void runModeration(pending)}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        open={pending?.kind === "restore"}
        title="Restore this post?"
        message={
          pending?.kind === "restore"
            ? "The post returns to the campus feed as published. Any open reports stay open until you triage them."
            : ""
        }
        confirmLabel="Restore post"
        tone="default"
        loading={working}
        onConfirm={() => pending && void runModeration(pending)}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        open={pending?.kind === "remove"}
        title="Remove this post?"
        message={
          pending?.kind === "remove"
            ? "This is a permanent moderation action: the post is struck from the feed and flagged as a policy violation on the author's record."
            : ""
        }
        confirmLabel="Remove post"
        tone="danger"
        loading={working}
        onConfirm={() => pending && void runModeration(pending)}
        onCancel={() => setPending(null)}
      />
    </>
  );
}

