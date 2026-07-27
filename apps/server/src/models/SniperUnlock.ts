import { Schema, model, type InferSchemaType } from "mongoose";

const sniperUnlockSchema = new Schema(
  {
    employerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

sniperUnlockSchema.index({ employerId: 1, candidateId: 1 }, { unique: true });

export type SniperUnlock = InferSchemaType<typeof sniperUnlockSchema>;

export const SniperUnlockModel = model("SniperUnlock", sniperUnlockSchema);
