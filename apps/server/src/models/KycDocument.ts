import { Schema, model, type InferSchemaType } from "mongoose";

export const KYC_DOCUMENT_TYPES = ["kimlik", "diploma", "kurumsal_belge"] as const;
export const KYC_DOCUMENT_STATUSES = ["pending", "approved", "rejected", "needs_review"] as const;

export type KycDocumentType = (typeof KYC_DOCUMENT_TYPES)[number];
export type KycDocumentStatus = (typeof KYC_DOCUMENT_STATUSES)[number];

const kycDocumentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    documentType: { type: String, enum: KYC_DOCUMENT_TYPES, required: true },
    storageKey: { type: String, required: true },
    contentType: { type: String, required: true },
    claimedFullName: { type: String, required: true },
    status: { type: String, enum: KYC_DOCUMENT_STATUSES, default: "pending" },
    extractedFullName: { type: String, default: null },
    reviewNote: { type: String, default: null },
  },
  { timestamps: true },
);

export type KycDocument = InferSchemaType<typeof kycDocumentSchema>;

export const KycDocumentModel = model("KycDocument", kycDocumentSchema);
