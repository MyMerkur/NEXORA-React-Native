import { Schema, model, Types } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export interface RefreshTokenDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export const RefreshTokenModel = model<RefreshTokenDoc>("RefreshToken", refreshTokenSchema);
