import { Schema, model, type InferSchemaType } from "mongoose";

export const AFFILIATION_REQUEST_STATUSES = ["pending", "approved", "rejected"] as const;
export type AffiliationRequestStatus = (typeof AFFILIATION_REQUEST_STATUSES)[number];

const affiliationRequestSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: AFFILIATION_REQUEST_STATUSES, default: "pending" },
  },
  { timestamps: true },
);

affiliationRequestSchema.index({ orgId: 1, status: 1, createdAt: -1 });
affiliationRequestSchema.index({ userId: 1, createdAt: -1 });

export type AffiliationRequest = InferSchemaType<typeof affiliationRequestSchema>;

export const AffiliationRequestModel = model("AffiliationRequest", affiliationRequestSchema);
