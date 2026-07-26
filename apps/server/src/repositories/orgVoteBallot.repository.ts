import { Types } from "mongoose";
import { OrgVoteBallotModel } from "../models/OrgVoteBallot";

export async function create(data: { voteId: string; userId: string; optionIndex: number }) {
  return OrgVoteBallotModel.create({
    voteId: new Types.ObjectId(data.voteId),
    userId: new Types.ObjectId(data.userId),
    optionIndex: data.optionIndex,
  });
}

export async function findByVoteAndUser(voteId: string, userId: string) {
  return OrgVoteBallotModel.findOne({
    voteId: new Types.ObjectId(voteId),
    userId: new Types.ObjectId(userId),
  });
}

export async function countsByVote(voteId: string): Promise<Map<number, number>> {
  const rows = await OrgVoteBallotModel.aggregate<{ _id: number; count: number }>([
    { $match: { voteId: new Types.ObjectId(voteId) } },
    { $group: { _id: "$optionIndex", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((row) => [row._id, row.count]));
}
