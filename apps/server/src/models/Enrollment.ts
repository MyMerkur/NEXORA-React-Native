import { Schema, model, type InferSchemaType } from "mongoose";

export const ENROLLMENT_STATUSES = ["enrolled", "completed"] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

const enrollmentSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ENROLLMENT_STATUSES, default: "enrolled" },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

enrollmentSchema.index({ courseId: 1, userId: 1 }, { unique: true });

export type Enrollment = InferSchemaType<typeof enrollmentSchema>;

export const EnrollmentModel = model("Enrollment", enrollmentSchema);
