import { apiClient } from "./authApi";

export type ThreadCategory = "job" | "case" | "general";
export type ThreadContextType = "job" | "case" | "org";

export interface ThreadParticipant {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface ThreadSummary {
  id: string;
  category: ThreadCategory;
  participant: ThreadParticipant;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
}

export interface ThreadsPage {
  threads: ThreadSummary[];
  nextCursor: string | null;
}

export interface MessageItem {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface MessagesPage {
  messages: MessageItem[];
  nextCursor: string | null;
}

export async function startThread(
  targetUserId: string,
  context?: { type: ThreadContextType; id?: string },
): Promise<ThreadSummary> {
  const { data } = await apiClient.post<ThreadSummary>("/api/v1/inbox/threads", {
    targetUserId,
    contextType: context?.type,
    contextId: context?.id,
  });
  return data;
}

export async function listThreads(cursor?: string): Promise<ThreadsPage> {
  const { data } = await apiClient.get<ThreadsPage>("/api/v1/inbox/threads", { params: { cursor } });
  return data;
}

export async function listMessages(threadId: string, cursor?: string): Promise<MessagesPage> {
  const { data } = await apiClient.get<MessagesPage>(`/api/v1/inbox/threads/${threadId}/messages`, {
    params: { cursor },
  });
  return data;
}

export async function sendMessage(threadId: string, body: string): Promise<MessageItem> {
  const { data } = await apiClient.post<MessageItem>(`/api/v1/inbox/threads/${threadId}/messages`, { body });
  return data;
}

export async function getUnreadThreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>("/api/v1/inbox/unread-count");
  return data.count;
}
