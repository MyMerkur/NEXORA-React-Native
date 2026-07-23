import type { Types } from "mongoose";
import { ApplicationModel, type ApplicationStatus } from "../models/Application";

interface CreateApplicationInput {
  jobId: Types.ObjectId;
  applicantId: Types.ObjectId;
  message: string;
}

export async function createApplication(data: CreateApplicationInput) {
  return ApplicationModel.create(data);
}

export async function findExisting(jobId: Types.ObjectId, applicantId: Types.ObjectId) {
  return ApplicationModel.findOne({ jobId, applicantId });
}

export async function listByApplicant(applicantId: Types.ObjectId) {
  return ApplicationModel.find({ applicantId }).sort({ createdAt: -1 }).limit(100).populate("jobId", "title employerId");
}

export async function listByJob(jobId: Types.ObjectId) {
  return ApplicationModel.find({ jobId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("applicantId", "email showcase.displayName showcase.avatarKey");
}

export async function findApplicationById(id: string) {
  return ApplicationModel.findById(id);
}

export async function updateStatus(id: string, status: ApplicationStatus) {
  return ApplicationModel.findByIdAndUpdate(id, { status }, { new: true });
}
