import type { Types } from "mongoose";
import { CertificateModel } from "../models/Certificate";

interface CreateCertificateInput {
  enrollmentId: Types.ObjectId;
  courseId: Types.ObjectId;
  userId: Types.ObjectId;
  verificationCode: string;
  issuedAt: Date;
}

export async function create(data: CreateCertificateInput) {
  return CertificateModel.create(data);
}

export async function findByEnrollmentId(enrollmentId: Types.ObjectId) {
  return CertificateModel.findOne({ enrollmentId });
}

export async function findByVerificationCode(code: string) {
  return CertificateModel.findOne({ verificationCode: code })
    .populate({
      path: "courseId",
      select: "title instructorId",
      populate: { path: "instructorId", select: "email showcase.displayName" },
    })
    .populate("userId", "email showcase.displayName");
}
