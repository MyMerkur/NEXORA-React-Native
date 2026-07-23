import { Types } from "mongoose";
import { JobSwipeModel, type SwipedBy, type SwipeDirection } from "../models/JobSwipe";

interface UpsertSwipeInput {
  jobId: string;
  candidateId: string;
  swipedBy: SwipedBy;
  direction: SwipeDirection;
}

export async function upsertSwipe(data: UpsertSwipeInput) {
  return JobSwipeModel.findOneAndUpdate(
    { jobId: new Types.ObjectId(data.jobId), candidateId: new Types.ObjectId(data.candidateId), swipedBy: data.swipedBy },
    { direction: data.direction },
    { upsert: true, new: true },
  );
}

export async function findRightSwipe(jobId: string, candidateId: string, swipedBy: SwipedBy) {
  return JobSwipeModel.findOne({
    jobId: new Types.ObjectId(jobId),
    candidateId: new Types.ObjectId(candidateId),
    swipedBy,
    direction: "right",
  });
}

export async function listSwipedJobIds(candidateId: string) {
  return JobSwipeModel.distinct("jobId", { candidateId: new Types.ObjectId(candidateId), swipedBy: "candidate" });
}

export async function listSwipedCandidateIds(jobId: string) {
  return JobSwipeModel.distinct("candidateId", { jobId: new Types.ObjectId(jobId), swipedBy: "employer" });
}
