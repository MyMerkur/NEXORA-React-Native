import { Schema, model, type InferSchemaType } from "mongoose";

export const INSTRUCTOR_INVITE_STATUSES = ["pending", "accepted", "expired", "revoked"] as const;
export type InstructorInviteStatus = (typeof INSTRUCTOR_INVITE_STATUSES)[number];

const instructorInviteSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    invitedByAdminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: INSTRUCTOR_INVITE_STATUSES, default: "pending" },
    acceptedByUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    acceptedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

instructorInviteSchema.index({ email: 1, status: 1 });

export type InstructorInvite = InferSchemaType<typeof instructorInviteSchema>;

export const InstructorInviteModel = model("InstructorInvite", instructorInviteSchema);
