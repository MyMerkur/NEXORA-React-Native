import { Schema, model, type InferSchemaType } from "mongoose";

const instagramConnectionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    instagramUserId: { type: String, required: true },
    username: { type: String, required: true },
    accessTokenEncrypted: { type: String, required: true },
    tokenExpiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export type InstagramConnection = InferSchemaType<typeof instagramConnectionSchema>;

export const InstagramConnectionModel = model("InstagramConnection", instagramConnectionSchema);
