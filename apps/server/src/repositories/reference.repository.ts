import { Types } from "mongoose";
import { ReferenceModel, type ReferenceStatus } from "../models/Reference";

export async function createRequest(subjectId: string, authorId: string) {
  return ReferenceModel.create({
    subjectId: new Types.ObjectId(subjectId),
    authorId: new Types.ObjectId(authorId),
    status: "pending",
  });
}

export async function createDirect(data: { subjectId: string; authorId: string; relationship: string; body: string }) {
  return ReferenceModel.create({
    subjectId: new Types.ObjectId(data.subjectId),
    authorId: new Types.ObjectId(data.authorId),
    status: "written",
    relationship: data.relationship,
    body: data.body,
  });
}

export async function findById(id: string) {
  return ReferenceModel.findById(id);
}

export async function markWritten(id: string, data: { relationship: string; body: string }) {
  return ReferenceModel.findByIdAndUpdate(id, { status: "written", relationship: data.relationship, body: data.body }, { new: true });
}

export async function setVisibility(id: string, status: Extract<ReferenceStatus, "written" | "hidden">) {
  return ReferenceModel.findByIdAndUpdate(id, { status }, { new: true });
}

export async function listIncoming(authorId: string) {
  return ReferenceModel.find({ authorId: new Types.ObjectId(authorId), status: "pending" }).sort({ createdAt: -1 });
}

export async function listBySubject(subjectId: string, statuses: ReferenceStatus[]) {
  return ReferenceModel.find({ subjectId: new Types.ObjectId(subjectId), status: { $in: statuses } }).sort({
    createdAt: -1,
  });
}
