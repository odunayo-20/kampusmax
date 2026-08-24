import {
  AnnouncementInput,
  AnnouncementListQuery,
  AnnouncementStatus,
  CommunityComment,
  CommunityCommentStatus,
  CommunityEvent,
  CommunityEventStatus,
  CommunityPost,
  CommunityPostDetail,
  CommunityPostStatus,
  CommunityReport,
  CommunityReportStatus,
  CommunitySectionCounts,
  CommentListQuery,
  EventListQuery,
  ListQuery,
  ManagedAnnouncement,
  ManagedPoll,
  ManagedPollStatus,
  Paginated,
  PollListQuery,
  PostListQuery,
  ReportListQuery,
} from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";
import { communityDataset } from "@/data/admin/community";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/campus)
// ------------------------------------------------------------

export type CommunityAnnouncementCreateInput = AnnouncementInput & {
  /** How the announcement should land after save. */
  submitAs: "draft" | "scheduled" | "published";
};

export interface CommunityAuthorSummary {
  postsCount: number;
  commentsCount: number;
  reportsAgainst: number;
}

export interface CommunityOverviewStats {
  openReports: number;
  flaggedPosts: number;
  liveEvents: number;
  activePolls: number;
  scheduledAnnouncements: number;
}

export interface AdminCommunityService {
  getOverviewStats(): Promise<CommunityOverviewStats>;

  // Posts
  listPosts(query?: PostListQuery): Promise<Paginated<CommunityPost>>;
  getPostDetail(id: string): Promise<CommunityPostDetail | null>;
  setPostStatus(id: string, status: CommunityPostStatus): Promise<CommunityPost>;
  getPostCounts(): Promise<CommunitySectionCounts<CommunityPostStatus>>;

  // Comments
  listComments(query?: CommentListQuery): Promise<Paginated<CommunityComment>>;
  setCommentStatus(
    id: string,
    status: CommunityCommentStatus
  ): Promise<CommunityComment>;
  getCommentCounts(): Promise<CommunitySectionCounts<CommunityCommentStatus>>;

  // Events
  listEvents(query?: EventListQuery): Promise<Paginated<CommunityEvent>>;
  setEventStatus(
    id: string,
    status: CommunityEventStatus
  ): Promise<CommunityEvent>;
  getEventCounts(): Promise<CommunitySectionCounts<CommunityEventStatus>>;

  // Announcements
  listAnnouncements(
    query?: AnnouncementListQuery
  ): Promise<Paginated<ManagedAnnouncement>>;
  createAnnouncement(
    input: CommunityAnnouncementCreateInput
  ): Promise<ManagedAnnouncement>;
  updateAnnouncement(
    id: string,
    patch: Partial<AnnouncementInput>
  ): Promise<ManagedAnnouncement>;
  publishAnnouncement(id: string): Promise<ManagedAnnouncement>;
  scheduleAnnouncement(
    id: string,
    publishAt: string
  ): Promise<ManagedAnnouncement>;
  archiveAnnouncement(id: string): Promise<ManagedAnnouncement>;

  // Reports
  listReports(query?: ReportListQuery): Promise<Paginated<CommunityReport>>;
  listReportsForTarget(targetId: string): Promise<CommunityReport[]>;
  setReportStatus(
    id: string,
    status: Exclude<CommunityReportStatus, "open">
  ): Promise<CommunityReport>;
  getReportCounts(): Promise<CommunitySectionCounts<CommunityReportStatus>>;

  // Polls
  listPolls(query?: PollListQuery): Promise<Paginated<ManagedPoll>>;
  setPollStatus(id: string, status: ManagedPollStatus): Promise<ManagedPoll>;
  getPollCounts(): Promise<CommunitySectionCounts<ManagedPollStatus>>;

  // Cross-section helpers
  getAuthorSummary(authorId: string): Promise<CommunityAuthorSummary>;
}

// ------------------------------------------------------------
// MOCK IMPLEMENTATION
// ------------------------------------------------------------

function sectionCounts<S extends string>(
  rows: { status: S }[],
  keys: readonly S[]
): CommunitySectionCounts<S> {
  const byStatus = Object.fromEntries(
    keys.map((k) => [k, rows.filter((r) => r.status === k).length])
  ) as Record<S, number>;
  return { all: rows.length, byStatus };
}

const POST_STATUSES: CommunityPostStatus[] = [
  "published",
  "hidden",
  "reported",
  "removed",
  "under_review",
];
const COMMENT_STATUSES: CommunityCommentStatus[] = [
  "published",
  "hidden",
  "removed",
];
const EVENT_STATUSES: CommunityEventStatus[] = [
  "draft",
  "upcoming",
  "live",
  "completed",
  "cancelled",
];
const ANNOUNCEMENT_STATUSES: AnnouncementStatus[] = [
  "draft",
  "scheduled",
  "published",
  "archived",
];
const REPORT_STATUSES: CommunityReportStatus[] = [
  "open",
  "reviewing",
  "actioned",
  "dismissed",
];
const POLL_STATUSES: ManagedPollStatus[] = ["active", "closed"];

export function createMockCommunityService(): AdminCommunityService {
  const posts = communityDataset.posts.map((p) => ({ ...p }));
  const comments = communityDataset.comments.map((c) => ({ ...c }));
  const events = communityDataset.events.map((e) => ({ ...e }));
  const announcements = communityDataset.announcements.map((a) => ({ ...a }));
  const reports = communityDataset.reports.map((r) => ({ ...r }));
  const polls = communityDataset.polls.map((p) => ({ ...p }));
  let createdAnnouncements = 0;

  function requirePost(id: string): CommunityPost {
    const post = posts.find((p) => p.id === id);
    if (!post) throw new Error(`Post ${id} not found`);
    return post;
  }

  function requireRow<T extends { id: string }>(
    rows: T[],
    id: string,
    label: string
  ): T {
    const row = rows.find((r) => r.id === id);
    if (!row) throw new Error(`${label} ${id} not found`);
    return row;
  }

  /** Keep the derived counter in sync with moderation decisions. */
  function syncPostReportsCount(postId: string): void {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    if (post.status === "reported" || post.status === "under_review") {
      post.reportsCount = Math.max(
        post.reportsCount,
        reports.filter((r) => r.targetType === "post" && r.targetId === postId)
          .length || 1
      );
    }
  }

  return {
    async getOverviewStats() {
      await apiDelay(90);
      return {
        openReports: reports.filter((r) => r.status === "open").length,
        flaggedPosts: posts.filter(
          (p) => p.status === "reported" || p.status === "under_review"
        ).length,
        liveEvents: events.filter((e) => e.status === "live").length,
        activePolls: polls.filter((p) => p.status === "active").length,
        scheduledAnnouncements: announcements.filter(
          (a) => a.status === "scheduled"
        ).length,
      };
    },

    // ---------------- Posts ----------------

    async listPosts(query = {}) {
      await apiDelay();
      const { search, status = "all", type = "all", campusId = "all", ...rest } =
        query;

      let rows = posts.filter(
        (p) =>
          (status === "all" || p.status === status) &&
          (type === "all" || p.type === type) &&
          (campusId === "all" || p.campusId === campusId)
      );
      rows = applySearch(rows, search, (p) => [
        p.content,
        p.author.name,
        p.author.id,
        p.id,
      ]);
      rows = applySort(
        rows,
        rest.sortBy,
        rest.sortDir ?? "desc",
        {
          createdAt: (p) => new Date(p.createdAt).getTime(),
          engagement: (p) => p.likeCount + p.commentCount + p.shareCount,
          reports: (p) => p.reportsCount,
          author: (p) => p.author.name.toLowerCase(),
        },
        "createdAt"
      );
      return paginate(rows, rest as ListQuery);
    },

    async getPostDetail(id) {
      await apiDelay(160);
      const post = posts.find((p) => p.id === id);
      if (!post) return null;
      return {
        post: { ...post },
        comments: comments
          .filter((c) => c.postId === id)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .map((c) => ({ ...c })),
        reports: reports.filter(
          (r) =>
            (r.targetType === "post" && r.targetId === id) ||
            comments.some(
              (c) => c.postId === id && c.id === r.targetId && r.targetType === "comment"
            )
        ),
      };
    },

    async setPostStatus(id, status) {
      await apiDelay();
      const post = requirePost(id);
      post.status = status;
      syncPostReportsCount(id);
      return { ...post };
    },

    async getPostCounts() {
      await apiDelay(80);
      return sectionCounts(posts, POST_STATUSES);
    },

    // ---------------- Comments ----------------

    async listComments(query = {}) {
      await apiDelay();
      const { search, status = "all", campusId = "all", ...rest } = query;

      let rows = comments.filter(
        (c) =>
          (status === "all" || c.status === status) &&
          (campusId === "all" || c.campusId === campusId)
      );
      rows = applySearch(rows, search, (c) => [
        c.content,
        c.author.name,
        c.postExcerpt,
        c.postId,
        c.id,
      ]);
      rows = applySort(
        rows,
        rest.sortBy,
        rest.sortDir ?? "desc",
        {
          createdAt: (c) => new Date(c.createdAt).getTime(),
          likes: (c) => c.likeCount,
          author: (c) => c.author.name.toLowerCase(),
        },
        "createdAt"
      );
      return paginate(rows, rest as ListQuery);
    },

    async setCommentStatus(id, status) {
      await apiDelay();
      return { ...requireRow(comments, id, "Comment"), status };
    },

    async getCommentCounts() {
      await apiDelay(70);
      return sectionCounts(comments, COMMENT_STATUSES);
    },

    // ---------------- Events ----------------

    async listEvents(query = {}) {
      await apiDelay();
      const { search, status = "all", campusId = "all", ...rest } = query;

      let rows = events.filter(
        (e) =>
          (status === "all" || e.status === status) &&
          (campusId === "all" || e.campusId === campusId)
      );
      rows = applySearch(rows, search, (e) => [
        e.title,
        e.organizer.name,
        e.venue,
        e.id,
      ]);
      rows = applySort(
        rows,
        rest.sortBy,
        rest.sortDir ?? "desc",
        {
          startsAt: (e) => new Date(e.startsAt).getTime(),
          attendees: (e) => e.attendeeCount,
          title: (e) => e.title.toLowerCase(),
        },
        "startsAt"
      );
      return paginate(rows, rest as ListQuery);
    },

    async setEventStatus(id, status) {
      await apiDelay();
      return { ...requireRow(events, id, "Event"), status };
    },

    async getEventCounts() {
      await apiDelay(70);
      return sectionCounts(events, EVENT_STATUSES);
    },

    // ---------------- Announcements ----------------

    async listAnnouncements(query = {}) {
      await apiDelay();
      const { search, status = "all", ...rest } = query;

      let rows = announcements.filter(
        (a) => status === "all" || a.status === status
      );
      rows = applySearch(rows, search, (a) => [
        a.title,
        a.body,
        a.createdBy,
        a.id,
      ]);
      rows = applySort(
        rows,
        rest.sortBy,
        rest.sortDir ?? "desc",
        {
          publishAt: (a) =>
            a.publishAt ? new Date(a.publishAt).getTime() : 0,
          createdAt: (a) => new Date(a.createdAt).getTime(),
          title: (a) => a.title.toLowerCase(),
        },
        "createdAt"
      );
      return paginate(rows, rest as ListQuery);
    },

    async createAnnouncement(input) {
      await apiDelay();
      createdAnnouncements += 1;
      const now = new Date().toISOString();
      const announcement: ManagedAnnouncement = {
        id: `cmn-new-${String(createdAnnouncements).padStart(3, "0")}`,
        title: input.title.trim(),
        body: input.body.trim(),
        placement: input.placement,
        campusIds: [...input.campusIds],
        publishAt:
          input.submitAs === "scheduled" ? (input.publishAt ?? null) : null,
        createdBy: "Platform Admin",
        status:
          input.submitAs === "draft"
            ? "draft"
            : input.submitAs === "scheduled"
              ? "scheduled"
              : "published",
        createdAt: now,
        updatedAt: now,
      };
      announcements.unshift(announcement);
      return { ...announcement };
    },

    async updateAnnouncement(id, patch) {
      await apiDelay();
      const row = requireRow(announcements, id, "Announcement");
      Object.assign(row, patch, { updatedAt: new Date().toISOString() });
      return { ...row };
    },

    async publishAnnouncement(id) {
      await apiDelay();
      const row = requireRow(announcements, id, "Announcement");
      if (row.status === "archived")
        throw new Error("Unarchive the announcement before publishing it.");
      row.status = "published";
      row.publishAt = new Date().toISOString();
      row.updatedAt = row.publishAt;
      return { ...row };
    },

    async scheduleAnnouncement(id, publishAt) {
      await apiDelay();
      const when = new Date(publishAt);
      if (Number.isNaN(when.getTime()))
        throw new Error("Pick a valid schedule date and time.");
      const row = requireRow(announcements, id, "Announcement");
      row.status = "scheduled";
      row.publishAt = when.toISOString();
      row.updatedAt = new Date().toISOString();
      return { ...row };
    },

    async archiveAnnouncement(id) {
      await apiDelay();
      const row = requireRow(announcements, id, "Announcement");
      row.status = "archived";
      row.updatedAt = new Date().toISOString();
      return { ...row };
    },

    // ---------------- Reports ----------------

    async listReports(query = {}) {
      await apiDelay();
      const { status = "all", targetType = "all", ...rest } = query;

      let rows = reports.filter(
        (r) =>
          (status === "all" || r.status === status) &&
          (targetType === "all" || r.targetType === targetType)
      );
      rows = applySearch(rows, rest.search, (r) => [
        r.targetPreview,
        r.detail,
        r.reporterName,
        r.reason,
        r.id,
      ]);
      rows = applySort(
        rows,
        rest.sortBy,
        rest.sortDir ?? "desc",
        {
          createdAt: (r) => new Date(r.createdAt).getTime(),
          priority: (r) => ({ low: 0, medium: 1, high: 2 })[r.priority],
        },
        "createdAt"
      );
      return paginate(rows, rest as ListQuery);
    },

    async listReportsForTarget(targetId) {
      await apiDelay(120);
      return reports
        .filter((r) => r.targetId === targetId)
        .map((r) => ({ ...r }));
    },

    async setReportStatus(id, status) {
      await apiDelay();
      return { ...requireRow(reports, id, "Report"), status };
    },

    async getReportCounts() {
      await apiDelay(70);
      return sectionCounts(reports, REPORT_STATUSES);
    },

    // ---------------- Polls ----------------

    async listPolls(query = {}) {
      await apiDelay();
      const { search, status = "all", campusId = "all", ...rest } = query;

      let rows = polls.filter(
        (p) =>
          (status === "all" || p.status === status) &&
          (campusId === "all" || p.campusId === campusId)
      );
      rows = applySearch(rows, search, (p) => [
        p.question,
        ...p.options.map((o) => o.label),
        p.id,
      ]);
      rows = applySort(
        rows,
        rest.sortBy,
        rest.sortDir ?? "desc",
        {
          totalVotes: (p) => p.totalVotes,
          endsAt: (p) => new Date(p.endsAt).getTime(),
          createdAt: (p) => new Date(p.createdAt).getTime(),
        },
        "createdAt"
      );
      return paginate(rows, rest as ListQuery);
    },

    async setPollStatus(id, status) {
      await apiDelay();
      return { ...requireRow(polls, id, "Poll"), status };
    },

    async getPollCounts() {
      await apiDelay(60);
      return sectionCounts(polls, POLL_STATUSES);
    },

    // ---------------- Cross-section helpers ----------------

    async getAuthorSummary(authorId) {
      await apiDelay(140);
      return {
        postsCount: posts.filter((p) => p.author.id === authorId).length,
        commentsCount: comments.filter((c) => c.author.id === authorId).length,
        reportsAgainst: reports.filter(
          (r) =>
            posts.some(
              (p) =>
                p.author.id === authorId &&
                p.id === r.targetId &&
                r.targetType === "post"
            ) ||
            comments.some(
              (c) =>
                c.author.id === authorId &&
                c.id === r.targetId &&
                r.targetType === "comment"
            )
        ).length,
      };
    },
  };
}
