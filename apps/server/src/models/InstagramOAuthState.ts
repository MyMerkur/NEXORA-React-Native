import { Schema, model, type InferSchemaType } from "mongoose";

const instagramOAuthStateSchema = new Schema(
  {
    state: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

instagramOAuthStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type InstagramOAuthState = InferSchemaType<typeof instagramOAuthStateSchema>;

export const InstagramOAuthStateModel = model("InstagramOAuthState", instagramOAuthStateSchema);
