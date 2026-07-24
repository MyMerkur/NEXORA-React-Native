import { Types } from "mongoose";
import { ClinicReviewModel } from "../models/ClinicReview";

export async function upsertReview(data: { orgId: string; authorId: string; rating: number; comment: string }) {
  return ClinicReviewModel.findOneAndUpdate(
    { orgId: new Types.ObjectId(data.orgId), authorId: new Types.ObjectId(data.authorId) },
    { rating: data.rating, comment: data.comment },
    { upsert: true, new: true },
  );
}

export async function listByOrg(orgId: string) {
  return ClinicReviewModel.find({ orgId: new Types.ObjectId(orgId) })
    .sort({ createdAt: -1 })
    .populate("authorId", "email showcase.displayName showcase.avatarKey");
}
