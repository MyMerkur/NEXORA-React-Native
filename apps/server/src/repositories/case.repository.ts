import type { Types } from "mongoose";
import { CaseModel, type CaseStage } from "../models/Case";

interface CreateCaseInput {
  userId: Types.ObjectId;
  title: string;
  description: string;
  specialties: string[];
  images: { storageKey: string; stage: CaseStage }[];
}

export async function createCase(data: CreateCaseInput) {
  return CaseModel.create(data);
}

export async function listCasesPage(params: { cursor?: Date; limit: number }) {
  const query = params.cursor ? { createdAt: { $lt: params.cursor } } : {};
  const cases = await CaseModel.find(query)
    .sort({ createdAt: -1 })
    .limit(params.limit + 1)
    .populate("userId", "email showcase.displayName showcase.avatarKey");

  const hasMore = cases.length > params.limit;
  return { cases: hasMore ? cases.slice(0, params.limit) : cases, hasMore };
}
