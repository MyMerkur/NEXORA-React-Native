import { Schema, model, type InferSchemaType } from "mongoose";

export const REFERENCE_STATUSES = ["pending", "written", "hidden"] as const;
export type ReferenceStatus = (typeof REFERENCE_STATUSES)[number];

const referenceSchema = new Schema(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: REFERENCE_STATUSES, default: "pending" },
    relationship: { type: String, trim: true, maxlength: 160, default: "" },
    body: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true },
);

referenceSchema.index({ subjectId: 1, status: 1, createdAt: -1 });
referenceSchema.index({ authorId: 1, status: 1 });

export type Reference = InferSchemaType<typeof referenceSchema>;

export const ReferenceModel = model("Reference", referenceSchema);
