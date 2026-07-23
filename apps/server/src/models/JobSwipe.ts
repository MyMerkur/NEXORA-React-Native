import { Schema, model, type InferSchemaType } from "mongoose";

export const SWIPED_BY_VALUES = ["candidate", "employer"] as const;
export type SwipedBy = (typeof SWIPED_BY_VALUES)[number];

export const SWIPE_DIRECTIONS = ["left", "right"] as const;
export type SwipeDirection = (typeof SWIPE_DIRECTIONS)[number];

const jobSwipeSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    swipedBy: { type: String, enum: SWIPED_BY_VALUES, required: true },
    direction: { type: String, enum: SWIPE_DIRECTIONS, required: true },
  },
  { timestamps: true },
);

jobSwipeSchema.index({ jobId: 1, candidateId: 1, swipedBy: 1 }, { unique: true });

export type JobSwipe = InferSchemaType<typeof jobSwipeSchema>;

export const JobSwipeModel = model("JobSwipe", jobSwipeSchema);
