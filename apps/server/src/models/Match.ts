import { Schema, model, type InferSchemaType } from "mongoose";

const matchSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    threadId: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
  },
  { timestamps: true },
);

matchSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export type Match = InferSchemaType<typeof matchSchema>;

export const MatchModel = model("Match", matchSchema);
