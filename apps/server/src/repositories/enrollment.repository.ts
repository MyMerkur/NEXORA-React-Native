import type { Types } from "mongoose";
import { EnrollmentModel } from "../models/Enrollment";

interface CreateEnrollmentInput {
  courseId: Types.ObjectId;
  userId: Types.ObjectId;
}

export async function create(data: CreateEnrollmentInput) {
  return EnrollmentModel.create(data);
}

export async function findExisting(courseId: Types.ObjectId, userId: Types.ObjectId) {
  return EnrollmentModel.findOne({ courseId, userId });
}

export async function findById(id: string) {
  return EnrollmentModel.findById(id);
}

export async function listByUser(userId: Types.ObjectId) {
  return EnrollmentModel.find({ userId }).sort({ createdAt: -1 }).limit(100).populate("courseId", "title instructorId");
}

export async function listByCourse(courseId: Types.ObjectId) {
  return EnrollmentModel.find({ courseId })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("userId", "email showcase.displayName showcase.avatarKey");
}

export async function markCompleted(id: string) {
  return EnrollmentModel.findByIdAndUpdate(id, { status: "completed", completedAt: new Date() }, { new: true });
}
