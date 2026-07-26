import { Types } from "mongoose";
import { HubPostModel } from "../models/HubPost";

export async function create(data: { hubId: string; userId: string; text: string; images: { storageKey: string }[] }) {
  return HubPostModel.create({
    hubId: new Types.ObjectId(data.hubId),
    userId: new Types.ObjectId(data.userId),
    text: data.text,
    images: data.images,
  });
}

export async function listPage(params: { hubId: string; cursor?: Date; limit: number }) {
  const query: Record<string, unknown> = { hubId: new Types.ObjectId(params.hubId) };
  if (params.cursor) {
    query.createdAt = { $lt: params.cursor };
  }
  const posts = await HubPostModel.find(query)
    .sort({ createdAt: -1 })
    .limit(params.limit + 1)
    .populate("userId", "email showcase.displayName showcase.avatarKey");

  const hasMore = posts.length > params.limit;
  return { posts: hasMore ? posts.slice(0, params.limit) : posts, hasMore };
}
