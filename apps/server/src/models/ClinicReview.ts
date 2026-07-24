import { Schema, model, type InferSchemaType } from "mongoose";

const clinicReviewSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { timestamps: true },
);

clinicReviewSchema.index({ orgId: 1, authorId: 1 }, { unique: true });

export type ClinicReview = InferSchemaType<typeof clinicReviewSchema>;

export const ClinicReviewModel = model("ClinicReview", clinicReviewSchema);
