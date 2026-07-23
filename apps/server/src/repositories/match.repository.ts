import { Types } from "mongoose";
import { MatchModel } from "../models/Match";

interface CreateMatchInput {
  jobId: string;
  candidateId: string;
  employerId: string;
  threadId: string;
}

export async function findOrCreateMatch(data: CreateMatchInput) {
  try {
    return await MatchModel.create({
      jobId: new Types.ObjectId(data.jobId),
      candidateId: new Types.ObjectId(data.candidateId),
      employerId: new Types.ObjectId(data.employerId),
      threadId: new Types.ObjectId(data.threadId),
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code?: number }).code === 11000) {
      const existing = await MatchModel.findOne({
        jobId: new Types.ObjectId(data.jobId),
        candidateId: new Types.ObjectId(data.candidateId),
      });
      if (existing) {
        return existing;
      }
    }
    throw error;
  }
}

export async function listMatchesByUser(userId: string) {
  const objectId = new Types.ObjectId(userId);
  return MatchModel.find({ $or: [{ candidateId: objectId }, { employerId: objectId }] })
    .sort({ createdAt: -1 })
    .populate("jobId", "title");
}
