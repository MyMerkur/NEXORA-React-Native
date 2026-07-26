import { Types } from "mongoose";
import { OrgVoteModel, type OrgVoteStatus } from "../models/OrgVote";

export async function create(data: { orgId: string; question: string; options: string[] }) {
  return OrgVoteModel.create({
    orgId: new Types.ObjectId(data.orgId),
    question: data.question,
    options: data.options,
  });
}

export async function listByOrg(orgId: string) {
  return OrgVoteModel.find({ orgId: new Types.ObjectId(orgId) }).sort({ createdAt: -1 });
}

export async function findById(id: string) {
  return OrgVoteModel.findById(id);
}

export async function updateStatus(id: string, status: OrgVoteStatus) {
  return OrgVoteModel.findByIdAndUpdate(id, { $set: { status } }, { new: true });
}
