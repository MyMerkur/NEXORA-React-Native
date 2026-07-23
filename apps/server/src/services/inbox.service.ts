import { findUserById } from "../repositories/user.repository";
import {
  findThreadBetween,
  createThread,
  findThreadById,
  listThreadsByUser,
  touchThread,
} from "../repositories/thread.repository";
import {
  createMessage,
  listMessagesByThread,
  markThreadMessagesRead,
  countUnreadThreads,
  countUnreadInThread,
} from "../repositories/message.repository";
import { resolveUserSummary, type UserSummarySource } from "../utils/userSummary";
import { notifyNewMessage } from "./notification.service";
import { getIO, userRoom } from "../sockets";
import { HttpError } from "../utils/httpError";
import type { ThreadCategory, ThreadContextType } from "../models/Thread";

function categoryFromContext(contextType?: ThreadContextType): ThreadCategory {
  if (contextType === "job") return "job";
  if (contextType === "case") return "case";
  return "general";
}

function otherParticipant(participantIds: unknown[], userId: string): string {
  const other = participantIds.map((id) => (id as { toString(): string }).toString()).find((id) => id !== userId);
  if (!other) {
    throw new HttpError("Sohbet katılımcısı bulunamadı", 404);
  }
  return other;
}

async function serializeThread(thread: { _id: unknown; category: ThreadCategory; lastMessageAt: Date; lastMessagePreview: string; participantIds: unknown[] }, userId: string) {
  const threadId = (thread._id as { toString(): string }).toString();
  const otherUserId = otherParticipant(thread.participantIds, userId);
  const otherUser = await findUserById(otherUserId);
  const participant = otherUser
    ? await resolveUserSummary(otherUser as unknown as UserSummarySource)
    : { id: otherUserId, displayName: "Bilinmeyen kullanıcı", avatarUrl: null };
  const unreadCount = await countUnreadInThread(threadId, userId);

  return {
    id: threadId,
    category: thread.category,
    participant,
    lastMessageAt: thread.lastMessageAt,
    lastMessagePreview: thread.lastMessagePreview,
    unreadCount,
  };
}

export async function startOrGetThread(
  userId: string,
  targetUserId: string,
  context?: { type: ThreadContextType; id?: string },
) {
  if (targetUserId === userId) {
    throw new HttpError("Kendinize mesaj gönderemezsiniz", 400);
  }

  const target = await findUserById(targetUserId);
  if (!target) {
    throw new HttpError("Kullanıcı bulunamadı", 404);
  }

  let thread = await findThreadBetween(userId, targetUserId);
  if (!thread) {
    thread = await createThread({
      userIdA: userId,
      userIdB: targetUserId,
      category: categoryFromContext(context?.type),
      contextType: context?.type,
      contextId: context?.id,
    });
  }

  return serializeThread(thread, userId);
}

async function requireParticipant(threadId: string, userId: string) {
  const thread = await findThreadById(threadId);
  if (!thread) {
    throw new HttpError("Sohbet bulunamadı", 404);
  }
  const isParticipant = thread.participantIds.some((id) => (id as unknown as { toString(): string }).toString() === userId);
  if (!isParticipant) {
    throw new HttpError("Bu sohbete erişim yetkiniz yok", 403);
  }
  return thread;
}

export async function sendMessage(userId: string, threadId: string, body: string) {
  const thread = await requireParticipant(threadId, userId);
  const message = await createMessage(threadId, userId, body);
  const preview = body.length > 200 ? `${body.slice(0, 197)}...` : body;
  await touchThread(threadId, preview);

  const recipientId = otherParticipant(thread.participantIds, userId);
  const sender = await findUserById(userId);
  const senderName = sender ? sender.showcase.displayName || sender.email : "Bir kullanıcı";
  await notifyNewMessage(recipientId, senderName);

  getIO()
    ?.to(userRoom(recipientId))
    .emit("message:new", {
      threadId,
      message: {
        id: message._id.toString(),
        threadId,
        senderId: userId,
        body: message.body,
        read: false,
        createdAt: message.createdAt,
      },
    });

  return {
    id: message._id.toString(),
    threadId,
    senderId: userId,
    body: message.body,
    read: message.read,
    createdAt: message.createdAt,
  };
}

export async function listThreads(userId: string, cursor?: string) {
  const { threads, hasMore } = await listThreadsByUser(userId, {
    cursor: cursor ? new Date(cursor) : undefined,
    limit: 20,
  });

  const serialized = await Promise.all(threads.map((thread) => serializeThread(thread, userId)));
  const last = threads[threads.length - 1];
  const nextCursor = hasMore && last ? last.lastMessageAt.toISOString() : null;

  return { threads: serialized, nextCursor };
}

export async function listMessages(userId: string, threadId: string, cursor?: string) {
  const thread = await requireParticipant(threadId, userId);

  const { messages, hasMore } = await listMessagesByThread(threadId, {
    cursor: cursor ? new Date(cursor) : undefined,
    limit: 30,
  });

  await markThreadMessagesRead(threadId, userId);
  const otherUserId = otherParticipant(thread.participantIds, userId);
  getIO()?.to(userRoom(otherUserId)).emit("message:read", { threadId });

  const last = messages[messages.length - 1];
  const nextCursor = hasMore && last ? last.createdAt.toISOString() : null;

  return {
    messages: messages.map((message) => ({
      id: message._id.toString(),
      threadId,
      senderId: message.senderId.toString(),
      body: message.body,
      read: message.read,
      createdAt: message.createdAt,
    })),
    nextCursor,
  };
}

export async function getUnreadThreadCount(userId: string) {
  const count = await countUnreadThreads(userId);
  return { count };
}
