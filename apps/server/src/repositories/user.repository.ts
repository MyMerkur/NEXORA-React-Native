import type { Types } from "mongoose";
import { CANDIDATE_ROLES } from "@nexora/shared-constants";
import { UserModel, type User } from "../models/User";

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email });
}

export async function findUserById(id: string) {
  return UserModel.findById(id);
}

export async function createUser(data: Pick<User, "email" | "passwordHash" | "role">) {
  return UserModel.create(data);
}

export async function updateBillingInfo(
  userId: string,
  billingInfo: Partial<{
    identityNumberEncrypted: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
  }>,
) {
  const set: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(billingInfo)) {
    set[`billingInfo.${key}`] = value;
  }
  return UserModel.findByIdAndUpdate(userId, { $set: set }, { new: true });
}

export async function incrementJobCreditsBalance(userId: string, delta: number) {
  return UserModel.findByIdAndUpdate(userId, { $inc: { jobPostingCreditsBalance: delta } }, { new: true });
}

export async function listSwipeableCandidates(params: {
  excludedCandidateIds: Types.ObjectId[];
  specialties: string[];
  limit: number;
}) {
  const query: Record<string, unknown> = {
    role: { $in: CANDIDATE_ROLES },
    "career.openToWork": true,
    "career.hiddenSearch": false,
    _id: { $nin: params.excludedCandidateIds },
  };

  if (params.specialties.length > 0) {
    query.$or = [
      { "showcase.specialties": { $in: params.specialties } },
      { "career.desiredPositions": { $in: params.specialties } },
    ];
  }

  return UserModel.find(query).sort({ createdAt: -1 }).limit(params.limit);
}
