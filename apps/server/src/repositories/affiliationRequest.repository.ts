import { Types } from "mongoose";
import { AffiliationRequestModel } from "../models/AffiliationRequest";

export async function create(userId: string, orgId: string) {
  return AffiliationRequestModel.create({
    userId: new Types.ObjectId(userId),
    orgId: new Types.ObjectId(orgId),
  });
}

export async function findPendingByUserAndOrg(userId: string, orgId: string) {
  return AffiliationRequestModel.findOne({
    userId: new Types.ObjectId(userId),
    orgId: new Types.ObjectId(orgId),
    status: "pending",
  });
}

export async function findById(id: string) {
  return AffiliationRequestModel.findById(id);
}

export async function listPendingByOrg(orgId: string) {
  return AffiliationRequestModel.find({ orgId: new Types.ObjectId(orgId), status: "pending" })
    .sort({ createdAt: -1 })
    .populate("userId", "email showcase.displayName showcase.avatarKey");
}

export async function listByUser(userId: string) {
  return AffiliationRequestModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
}

export async function updateStatus(id: string, status: "approved" | "rejected") {
  return AffiliationRequestModel.findOneAndUpdate({ _id: id, status: "pending" }, { $set: { status } }, { new: true });
}
