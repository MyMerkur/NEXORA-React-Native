import { Types } from "mongoose";
import { MessageModel } from "../models/Message";
import { ThreadModel } from "../models/Thread";

export async function createMessage(threadId: string, senderId: string, body: string) {
  return MessageModel.create({ threadId: new Types.ObjectId(threadId), senderId: new Types.ObjectId(senderId), body });
}

export async function listMessagesByThread(threadId: string, params: { cursor?: Date; limit: number }) {
  const query: Record<string, unknown> = { threadId: new Types.ObjectId(threadId) };
  if (params.cursor) {
    query.createdAt = { $lt: params.cursor };
  }

  const messages = await MessageModel.find(query)
    .sort({ createdAt: -1 })
    .limit(params.limit + 1);

  const hasMore = messages.length > params.limit;
  return { messages: hasMore ? messages.slice(0, params.limit) : messages, hasMore };
}

export async function markThreadMessagesRead(threadId: string, readerId: string) {
  return MessageModel.updateMany(
    { threadId: new Types.ObjectId(threadId), senderId: { $ne: new Types.ObjectId(readerId) }, read: false },
    { read: true },
  );
}

export async function countUnreadThreads(userId: string): Promise<number> {
  const threadIds = await MessageModel.distinct("threadId", {
    senderId: { $ne: new Types.ObjectId(userId) },
    read: false,
  });
  if (threadIds.length === 0) {
    return 0;
  }

  const count = await ThreadModel.countDocuments({
    _id: { $in: threadIds },
    participantIds: new Types.ObjectId(userId),
  });
  return count;
}

export async function countUnreadInThread(threadId: string, userId: string): Promise<number> {
  return MessageModel.countDocuments({
    threadId: new Types.ObjectId(threadId),
    senderId: { $ne: new Types.ObjectId(userId) },
    read: false,
  });
}
