"use client";

import { useEffect, useState } from "react";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { MessageListFilters, messageKeys } from "@/lib/query-keys";
import {
  getConversationForUser,
  getMessages,
  getTotalUnreadCount,
  markAllAsRead,
  markAsRead,
  searchConversations,
  sendMessage,
} from "@/services/messages";
import { Conversation, Message } from "@/types";
import {
  CONVERSATIONS_PAGE_SIZE,
  MESSAGE_SEND_MIN_DELAY_MS,
  MESSAGES_PAGE_SIZE,
} from "@/config/messaging";

/**
 * Simulates network latency for the sync, in-memory store so the UI
 * exercises the same loading states it will against the real API.
 */
function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounced search value so the conversations query key changes at most
 * `delayMs` after the user's last keystroke (no request per keystroke).
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export interface ConversationPagePayload {
  items: Conversation[];
  nextCursor: number | null;
  hasMore: boolean;
}

export interface MessagePagePayload {
  items: Message[];
  olderCursor: number | null;
}

type MessageThreadQueryKey = readonly ["messages", "thread", string, string];

// ────────────────────────────────────────────────────────────────
// Reads
// ────────────────────────────────────────────────────────────────

/**
 * Multi-page conversation list. `enabled` only turns the query on after a
 * session is authenticated. Search is folded into the query key: each
 * debounced search term is its own cached query.
 */
export function useConversations(
  filters: MessageListFilters = { search: "" },
  options?: { pageSize?: number }
) {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const enabled = status === "authenticated" && !!userId;
  const pageSize = options?.pageSize ?? CONVERSATIONS_PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: messageKeys.conversations(userId ?? "", filters),
    enabled,
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<ConversationPagePayload> => {
      await delay();
      const all = searchConversations(userId!, filters.search);
      const items = all.slice(pageParam, pageParam + pageSize);
      const nextCursor =
        pageParam + pageSize < all.length ? pageParam + pageSize : null;
      return { items, nextCursor, hasMore: nextCursor !== null };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      flattened: data.pages.flatMap((page) => page.items),
    }),
  });
}

/**
 * Single, membership-checked conversation. The service returns `undefined`
 * for conversations the session user does not belong to (or that don't
 * exist) and both surface as a NOT_FOUND so the UI never reveals the
 * existence of private conversations.
 */
export function useConversation(conversationId: string) {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const enabled = status === "authenticated" && !!userId && !!conversationId;

  return useQuery({
    queryKey: messageKeys.conversation(conversationId, userId ?? ""),
    enabled,
    queryFn: async () => {
      await delay(0);
      const conversation = getConversationForUser(conversationId, userId!);
      if (!conversation) {
        throw Object.assign(new Error("Conversation not found"), {
          code: "NOT_FOUND",
        });
      }
      return conversation;
    },
  });
}

/**
 * Newest-last, cursor-paged message thread. The first page holds the most
 * recent `pageSize` messages (ascending); older pages are fetched backwards
 * via `fetchPreviousPage`. Only enabled once the session user is confirmed a
 * participant, so message content is never fetched for unauthorised ids.
 */
export function useMessages(
  conversationId: string,
  isParticipant: boolean,
  options?: { pageSize?: number }
) {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const enabled =
    status === "authenticated" && !!userId && !!conversationId && isParticipant;
  const pageSize = options?.pageSize ?? MESSAGES_PAGE_SIZE;

  return useInfiniteQuery<
    MessagePagePayload,
    Error,
    {
      pages: MessagePagePayload[];
      pageParams: number[];
      flattened: Message[];
    },
    MessageThreadQueryKey,
    number
  >({
    queryKey: messageKeys.thread(conversationId, userId ?? ""),
    enabled,
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<MessagePagePayload> => {
      await delay();
      const all = getMessages(conversationId!);
      const end = Math.max(0, all.length - pageParam);
      const start = Math.max(0, end - pageSize);
      const items = all.slice(start, end);
      const olderCursor = start > 0 ? pageParam + pageSize : null;
      return { items, olderCursor };
    },
    // A newest-last thread only ever loads older pages, so there is no
    // "next" (newer) direction.
    getNextPageParam: () => null,
    getPreviousPageParam: (firstPage) => firstPage.olderCursor,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      flattened: data.pages.flatMap((page) => page.items),
    }),
  });
}

/**
 * Shared header/badge counter. A separate key means bumping the badge never
 * refetches the full list or any thread.
 */
export function useUnreadMessageCount() {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const enabled = status === "authenticated" && !!userId;

  return useQuery({
    queryKey: messageKeys.unreadCount(userId ?? ""),
    enabled,
    queryFn: async () => {
      await delay(0);
      return getTotalUnreadCount(userId!);
    },
  });
}

// ────────────────────────────────────────────────────────────────
// Cache helpers
// ────────────────────────────────────────────────────────────────

type ThreadData = InfiniteData<MessagePagePayload, number>;
type ConversationsData = InfiniteData<ConversationPagePayload, number>;

const CONVERSATIONS_QUERY_PREFIX = ["messages", "conversations"] as const;

function setThreadQueriesData(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  conversationId: string,
  updater: (data: ThreadData | undefined) => ThreadData | undefined
): void {
  queryClient.setQueriesData<ThreadData>(
    { queryKey: messageKeys.thread(conversationId, userId) },
    updater
  );
}

function setConversationsQueriesData(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  updater: (data: ConversationsData | undefined) => ConversationsData | undefined
): void {
  queryClient.setQueriesData<ConversationsData>(
    {
      queryKey: [
        ...CONVERSATIONS_QUERY_PREFIX,
        userId,
      ] as const,
    },
    updater
  );
}

// ────────────────────────────────────────────────────────────────
// Mutations
// ────────────────────────────────────────────────────────────────

export interface SendMessageInput {
  conversationId: string;
  text: string;
}

/**
 * Sends a message to a conversation. The sender identity comes from the
 * authenticated session (never from the client input — mass-assignment
 * safe), ids are generated by the store, and the conversation is only
 * written when the session user is a member. The composer stays disabled
 * while pending and only clears after this resolves, so a failure never
 * loses the draft.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useMutation({
    mutationFn: async ({ conversationId, text }: SendMessageInput): Promise<Message> => {
      await delay(MESSAGE_SEND_MIN_DELAY_MS);
      return sendMessage(conversationId, userId!, text);
    },
    onSuccess: (message, { conversationId }) => {
      if (!userId) return;
      // Append to the newest page of the open thread so the message appears
      // immediately; the conversations preview refreshes on settle.
      setThreadQueriesData(queryClient, userId, conversationId, (data) => {
        if (!data) return data;
        const newestPageIndex = data.pages.length - 1;
        return {
          ...data,
          pages: data.pages.map((page, index) =>
            index === newestPageIndex
              ? { ...page, items: [...page.items, message] }
              : page
          ),
        };
      });
      setConversationsQueriesData(queryClient, userId, (data) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    lastMessage: message,
                    updatedAt: message.createdAt,
                  }
                : conversation
            ),
          })),
        };
      });
    },
    onSettled: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
}

/**
 * Marks a conversation's incoming messages as read. The store only zeroes
 * the unread count for members and only flips messages from other
 * participants, matching what the real API will do server-side. Called once
 * per conversation open from a per-id effect — never per render.
 */
export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useMutation({
    mutationFn: async (conversationId: string) => {
      await delay(0);
      markAsRead(conversationId, userId!);
      return conversationId;
    },
    onSettled: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
}

/**
 * Marks every conversation in the session user's inbox as read. Unlike the
 * legacy version (which updated the store but never refreshed the UI), the
 * settle-time invalidation repaints the list and badge from the store.
 */
export function useMarkAllMessagesAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useMutation({
    mutationFn: async () => {
      await delay();
      if (userId) markAllAsRead(userId);
    },
    onSettled: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
}