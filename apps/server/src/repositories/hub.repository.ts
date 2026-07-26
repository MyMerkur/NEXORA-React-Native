import { Types } from "mongoose";
import { HubModel, type HubType } from "../models/Hub";

interface CreateHubInput {
  name: string;
  description: string;
  ownerId: Types.ObjectId;
  type: HubType;
  price: string;
  specialties: string[];
  iyzicoProductReferenceCode: string;
  iyzicoPricingPlanReferenceCode: string;
}

export async function create(data: CreateHubInput) {
  return HubModel.create(data);
}

export async function findById(id: string) {
  return HubModel.findById(id);
}

export async function listPage(params: { cursor?: Date; limit: number; specialty?: string }) {
  const query: Record<string, unknown> = {};
  if (params.cursor) {
    query.createdAt = { $lt: params.cursor };
  }
  if (params.specialty) {
    query.specialties = params.specialty;
  }
  const hubs = await HubModel.find(query)
    .sort({ createdAt: -1 })
    .limit(params.limit + 1);

  const hasMore = hubs.length > params.limit;
  return { hubs: hasMore ? hubs.slice(0, params.limit) : hubs, hasMore };
}

export async function listByOwner(ownerId: Types.ObjectId) {
  return HubModel.find({ ownerId }).sort({ createdAt: -1 });
}

export async function findByIds(ids: Types.ObjectId[]) {
  return HubModel.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
}

export async function incrementMemberCount(hubId: string, delta: number) {
  return HubModel.findByIdAndUpdate(hubId, { $inc: { memberCount: delta } }, { new: true });
}
