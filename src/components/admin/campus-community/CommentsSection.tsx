"use client";

import { useCallback, useEffect, useState } from "react";
import { EyeOff, RotateCcw, Search, ShieldOff, UserRound } from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { cn, formatDateShort, timeAgo } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import {
  COMMENT_STATUS_FILTER_ORDER,
  commentStatusLabel,
  commentStatusVariant,
} from "./campus-community-meta";
import { communityCampusName, previewText } from "./campus-community-utils";
import {
  AuthorCell,
  CommunitySectionShell,
  RowMenu,
} from "./shared";
import { AuthorDialog } from "./AuthorDialog";
import { communityService } from "@/services/admin";
import type {
  CommunityAuthor,
  CommunityComment,
  CommunityCommentStatus,
  CommunitySectionCounts,
  Paginated,
} from "@/types/admin";
import type { CampusOption } from "./PostsSection";

interface CommentPendingAction {
  kind: "hide" | "restore" | "remove";
  comment: CommunityComment;
}

export function CommentsSection({
  campusOptions,
  onToast,
}: {
  campusOptions: CampusOption[];
  onToast: (tone: "success" | "error", text: string) => void;
}) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput.trim(), 350);
  const [status, setStatus] = useState<CommunityCommentStatus | "all">("all");
  const [campusId, setCampusId] = useState("all");
  const [page, setPage] = useState(1);

  const [list, setList] = useState<Paginated<CommunityComment> | null>(null);
  const [counts, setCounts] =
    useState<CommunitySectionCounts<CommunityCommentStatus> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [author, setAuthor] = useState<CommunityAuthor | null>(null);
  const [pending, setPending] = useState<CommentPendingAction | null>(null);
  const [working, setWorking] = useState(false);

  const loadMeta = useCallback(async () => {
    try {
      setCounts(await communityService.getCommentCounts());
    } catch {
      /* non-critical */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await communityService.listComments({
        search: search || undefined,
        status,
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
  }, [search, status, campusId, page]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  async function runModeration(action: CommentPendingAction) {
    setWorking(true);
    try {
      await communityService.setCommentStatus(
        action.comment.id,
        action.kind === "hide"
          ? "hidden"
          : action.kind === "restore"
            ? "published"
            : "removed"
      );
      onToast(
        "success",
        action.kind === "hide"
          ? "Comment hidden."
          : action.kind === "restore"
            ? "Comment restored."
            : "Comment removed for policy violation."
      );
      setPending(null);
      await Promise.all([loadList(), loadMeta()]);
    } catch (err) {
      onToast(
        "error",
        err instanceof Error ? err.message : "Couldn't update that comment."
      );
    } finally {
      setWorking(false);
    }
  }

  /** Allowed moderation transitions per current status. */
  function actionsFor(c: CommunityComment) {
    return {
      hide: c.status === "published",
      restore: c.status === "hidden",
      remove: c.status !== "removed",
    };
  }

  const hasActiveFilters =
    searchInput.trim().length > 0 || status !== "all" || campusId !== "all";

  return (
    <>
      <div
        role="tablist"
        aria-label="Filter comments by status"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        {(["all", ...COMMENT_STATUS_FILTER_ORDER] as const).map((tab) => (
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
            {tab === "all" ? "All" : commentStatusLabel(tab)}
            {counts && (
              <span className="rounded-full bg-kampmax-muted px-1.5 py-px text-[10px] font-semibold tabular-nums">
                {tab === "all" ? counts.all : counts.byStatus[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="my-3 flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-64">
          <Input
            value={searchInput}
            placeholder="Search comments…"
            leftIcon={<Search className="h-4 w-4" />}
            aria-label="Search comments"
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
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
        emptyTitle="No comments yet"
        emptyMessage="Replies across campus posts will show up here."
        onRetry={() => void loadList()}
        onClearFilters={() => {
          setSearchInput("");
          setStatus("all");
          setCampusId("all");
        }}
      >
        <div className="hidden overflow-hidden rounded-lg border border-kampmax-border bg-white md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
                  <th scope="col" className="px-4 py-2.5 font-medium">Author</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Comment</th>
                  <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">On post</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Campus</th>
                  <th scope="col" className="hidden px-3 py-2.5 font-medium md:table-cell">Likes</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                  <th scope="col" className="hidden px-3 py-2.5 font-medium xl:table-cell">Created</th>
                  <th scope="col" className="w-10 px-2 py-2.5"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kampmax-border">
                {(list?.items ?? []).map((c) => {
                  const allowed = actionsFor(c);
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-kampmax-muted/40">
                      <td className="max-w-[160px] px-4 py-2.5">
                        <AuthorCell name={c.author.name} onViewAuthor={() => setAuthor(c.author)} />
                      </td>
                      <td className="max-w-[320px] px-3 py-2.5">
                        <p className="line-clamp-2 text-[13px] leading-snug text-kampmax-text">
                          {previewText(c.content, 110)}
                        </p>
                      </td>
                      <td className="hidden max-w-[220px] px-3 py-2.5 lg:table-cell">
                        <span
                          className="block truncate text-xs text-kampmax-text-secondary"
                          title={c.postExcerpt}
                        >
                          {c.postExcerpt}
                        </span>
                        <span className="font-mono text-[10px] uppercase text-kampmax-text-secondary/70">
                          {c.postId}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-kampmax-text-secondary">
                        {communityCampusName(c.campusId)}
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-2.5 tabular-nums text-kampmax-text-secondary md:table-cell">
                        {c.likeCount}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge
                          variant={commentStatusVariant(c.status)}
                          label={commentStatusLabel(c.status)}
                        />
                      </td>
                      <td
                        className="hidden whitespace-nowrap px-3 py-2.5 tabular-nums text-kampmax-text-secondary xl:table-cell"
                        title={new Date(c.createdAt).toISOString()}
                      >
                        {formatDateShort(c.createdAt)}
                        <span className="ml-1.5 text-[11px]">{timeAgo(c.createdAt)}</span>
                      </td>
                      <td className="px-2 py-2.5">
                        <RowMenu
                          label={`comment ${c.id}`}
                          actions={[
                            ...(allowed.hide
                              ? [
                                  {
                                    key: "hide",
                                    label: "Hide comment",
                                    icon: EyeOff,
                                    onSelect: () => setPending({ kind: "hide", comment: c }),
                                  },
                                ]
                              : []),
                            ...(allowed.restore
                              ? [
                                  {
                                    key: "restore",
                                    label: "Restore comment",
                                    icon: RotateCcw,
                                    onSelect: () => setPending({ kind: "restore", comment: c }),
                                  },
                                ]
                              : []),
                            ...(allowed.remove
                              ? [
                                  {
                                    key: "remove",
                                    label: "Remove comment",
                                    icon: ShieldOff,
                                    danger: true,
                                    onSelect: () => setPending({ kind: "remove", comment: c }),
                                  },
                                ]
                              : []),
                            {
                              key: "author",
                              label: "View author",
                              icon: UserRound,
                              onSelect: () => setAuthor(c.author),
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
          {(list?.items ?? []).map((c) => {
            const allowed = actionsFor(c);
            return (
              <li
                key={c.id}
                className="rounded-lg border border-kampmax-border bg-white p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthor(c.author)}
                    className="min-w-0 truncate text-left text-sm font-medium text-kampmax-blue"
                  >
                    {c.author.name}
                  </button>
                  <StatusBadge
                    variant={commentStatusVariant(c.status)}
                    label={commentStatusLabel(c.status)}
                  />
                </div>

                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-kampmax-text">
                  {previewText(c.content, 140)}
                </p>
                <p
                  className="mt-1 truncate text-[11px] text-kampmax-text-secondary"
                  title={c.postExcerpt}
                >
                  on &ldquo;{c.postExcerpt}&rdquo;
                </p>

                <div className="mt-2 flex items-center justify-between gap-2 border-t border-dashed border-kampmax-border pt-2">
                  <span className="min-w-0 truncate text-[11px] text-kampmax-text-secondary">
                    {communityCampusName(c.campusId)} ·{" "}
                    {formatDateShort(c.createdAt)} · {c.likeCount} likes
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    {allowed.hide && (
                      <button
                        type="button"
                        title="Hide comment"
                        onClick={() => setPending({ kind: "hide", comment: c })}
                        className="rounded-md p-1.5 text-amber-600 transition-colors hover:bg-amber-50"
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {allowed.restore && (
                      <button
                        type="button"
                        title="Restore comment"
                        onClick={() =>
                          setPending({ kind: "restore", comment: c })
                        }
                        className="rounded-md p-1.5 text-kampmax-success transition-colors hover:bg-emerald-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <RowMenu
                      label={`comment ${c.id}`}
                      actions={[
                        ...(allowed.remove
                          ? [
                              {
                                key: "remove",
                                label: "Remove comment",
                                icon: ShieldOff,
                                danger: true,
                                onSelect: () =>
                                  setPending({ kind: "remove", comment: c }),
                              },
                            ]
                          : []),
                        {
                          key: "author",
                          label: "View author",
                          icon: UserRound,
                          onSelect: () => setAuthor(c.author),
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

      <AuthorDialog author={author} onClose={() => setAuthor(null)} />

      <ConfirmDialog
        open={pending?.kind === "hide"}
        title="Hide this comment?"
        message={
          pending
            ? `The reply is pulled from the thread under “${previewText(pending.comment.postExcerpt, 60)}”. It stays recoverable and the author can appeal.`
            : ""
        }
        confirmLabel="Hide comment"
        tone="warning"
        loading={working}
        onConfirm={() => pending && void runModeration(pending)}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        open={pending?.kind === "restore"}
        title="Restore this comment?"
        message="The comment reappears in the original thread as published."
        confirmLabel="Restore comment"
        tone="default"
        loading={working}
        onConfirm={() => pending && void runModeration(pending)}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        open={pending?.kind === "remove"}
        title="Remove this comment?"
        message="This permanently removes the reply and records a policy violation on the author's account."
        confirmLabel="Remove comment"
        tone="danger"
        loading={working}
        onConfirm={() => pending && void runModeration(pending)}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
