import { Types } from "mongoose";
import { ThreadModel, buildParticipantsKey, type ThreadCategory, type ThreadContextType } from "../models/Thread";

interface CreateThreadInput {
  userIdA: string;
  userIdB: string;
  category: ThreadCategory;
  contextType?: ThreadContextType;
  contextId?: string;
}

export async function findThreadBetween(userIdA: string, userIdB: string) {
  const participantsKey = buildParticipantsKey(userIdA, userIdB);
  return ThreadModel.findOne({ participantsKey });
}

export async function createThread(data: CreateThreadInput) {
  const participantsKey = buildParticipantsKey(data.userIdA, data.userIdB);
  return ThreadModel.create({
    participantIds: [new Types.ObjectId(data.userIdA), new Types.ObjectId(data.userIdB)],
    participantsKey,
    category: data.category,
    contextType: data.contextType ?? null,
    contextId: data.contextId ? new Types.ObjectId(data.contextId) : null,
  });
}

export async function findThreadById(id: string) {
  return ThreadModel.findById(id);
}

export async function listThreadsByUser(userId: string, params: { cursor?: Date; limit: number }) {
  const query: Record<string, unknown> = { participantIds: new Types.ObjectId(userId) };
  if (params.cursor) {
    query.lastMessageAt = { $lt: params.cursor };
  }

  const threads = await ThreadModel.find(query)
    .sort({ lastMessageAt: -1 })
    .limit(params.limit + 1);

  const hasMore = threads.length > params.limit;
  return { threads: hasMore ? threads.slice(0, params.limit) : threads, hasMore };
}

export async function touchThread(threadId: string, lastMessagePreview: string) {
  return ThreadModel.findByIdAndUpdate(threadId, { lastMessageAt: new Date(), lastMessagePreview }, { new: true });
}
