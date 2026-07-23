import { Schema, model, type InferSchemaType } from "mongoose";

export const APPLICATION_STATUSES = ["pending", "accepted", "rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

const applicationSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    applicantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, trim: true, maxlength: 1000, default: "" },
    status: { type: String, enum: APPLICATION_STATUSES, default: "pending" },
  },
  { timestamps: true },
);

applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

export type Application = InferSchemaType<typeof applicationSchema>;

export const ApplicationModel = model("Application", applicationSchema);
