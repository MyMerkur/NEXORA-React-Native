import { Types } from "mongoose";
import { InstructorInviteModel } from "../models/InstructorInvite";

export async function create(data: { email: string; invitedByAdminId: string; token: string; expiresAt: Date }) {
  return InstructorInviteModel.create({
    email: data.email,
    invitedByAdminId: new Types.ObjectId(data.invitedByAdminId),
    token: data.token,
    expiresAt: data.expiresAt,
  });
}

export async function findByToken(token: string) {
  return InstructorInviteModel.findOne({ token });
}

export async function markExpired(id: string) {
  return InstructorInviteModel.findByIdAndUpdate(id, { $set: { status: "expired" } }, { new: true });
}

export async function markAccepted(id: string, userId: string) {
  return InstructorInviteModel.findByIdAndUpdate(
    id,
    { $set: { status: "accepted", acceptedByUserId: new Types.ObjectId(userId), acceptedAt: new Date() } },
    { new: true },
  );
}

export async function listAll() {
  return InstructorInviteModel.find().sort({ createdAt: -1 });
}
