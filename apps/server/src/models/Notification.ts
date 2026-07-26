import { Schema, model, type InferSchemaType } from "mongoose";

export const NOTIFICATION_TYPES = [
  "kyc_status",
  "new_application",
  "application_status",
  "new_message",
  "new_match",
  "reference_request",
  "reference_written",
  "subscription_activated",
  "subscription_renewed",
  "subscription_payment_failed",
  "subscription_canceled",
  "course_enrollment",
  "certificate_issued",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    body: { type: String, trim: true, maxlength: 500, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export type Notification = InferSchemaType<typeof notificationSchema>;

export const NotificationModel = model("Notification", notificationSchema);
