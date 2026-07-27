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

// Mirrors match.repository.ts::findOrCreateMatch — the unique index on participantsKey is the
// real concurrency guard, not a separate find-then-create (two requests starting a thread with
// the same counterpart at once would otherwise both pass a "no thread yet" check and race on
// insert, one of them crashing on the unique-index violation instead of just getting the thread).
export async function findOrCreateThread(data: CreateThreadInput) {
  const participantsKey = buildParticipantsKey(data.userIdA, data.userIdB);
  try {
    return await ThreadModel.create({
      participantIds: [new Types.ObjectId(data.userIdA), new Types.ObjectId(data.userIdB)],
      participantsKey,
      category: data.category,
      contextType: data.contextType ?? null,
      contextId: data.contextId ? new Types.ObjectId(data.contextId) : null,
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code?: number }).code === 11000) {
      const existing = await ThreadModel.findOne({ participantsKey });
      if (existing) {
        return existing;
      }
    }
    throw error;
  }
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
