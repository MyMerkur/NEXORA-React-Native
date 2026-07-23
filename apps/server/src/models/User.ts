import { Schema, model, type InferSchemaType } from "mongoose";

export const USER_ROLES = ["hekim", "asistan", "teknisyen", "klinik", "firma", "dernek"] as const;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true },
    kycLevel: { type: Number, min: 0, max: 4, default: 0 },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = model("User", userSchema);
