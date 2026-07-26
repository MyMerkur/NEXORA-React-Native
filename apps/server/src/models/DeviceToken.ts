import { Schema, model, type InferSchemaType } from "mongoose";

export const DEVICE_PLATFORMS = ["ios", "android"] as const;
export type DevicePlatform = (typeof DEVICE_PLATFORMS)[number];

const deviceTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: DEVICE_PLATFORMS, required: true },
  },
  { timestamps: true },
);

deviceTokenSchema.index({ userId: 1 });

export type DeviceToken = InferSchemaType<typeof deviceTokenSchema>;

export const DeviceTokenModel = model("DeviceToken", deviceTokenSchema);
