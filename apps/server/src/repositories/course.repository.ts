import type { Types } from "mongoose";
import { CourseModel } from "../models/Course";

interface CreateCourseInput {
  instructorId: Types.ObjectId;
  title: string;
  description: string;
  specialties: string[];
}

export async function create(data: CreateCourseInput) {
  return CourseModel.create(data);
}

export async function findById(id: string) {
  return CourseModel.findById(id);
}

export async function listAll() {
  return CourseModel.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("instructorId", "email showcase.displayName showcase.avatarKey");
}

export async function listByInstructor(instructorId: Types.ObjectId) {
  return CourseModel.find({ instructorId }).sort({ createdAt: -1 }).limit(100);
}
