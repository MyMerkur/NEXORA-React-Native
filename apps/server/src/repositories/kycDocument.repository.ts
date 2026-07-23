import { Types } from "mongoose";
import { KycDocumentModel, type KycDocumentType } from "../models/KycDocument";

export async function createKycDocument(data: {
  userId: Types.ObjectId;
  documentType: KycDocumentType;
  storageKey: string;
  contentType: string;
  claimedFullName: string;
}) {
  return KycDocumentModel.create(data);
}

export async function findApprovedByUserAndType(userId: Types.ObjectId, documentType: KycDocumentType) {
  return KycDocumentModel.findOne({ userId, documentType, status: "approved" });
}

export async function listByUser(userId: Types.ObjectId) {
  return KycDocumentModel.find({ userId }).sort({ createdAt: -1 });
}
