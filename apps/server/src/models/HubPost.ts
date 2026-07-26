import { Schema, model, type InferSchemaType } from "mongoose";

const hubPostImageSchema = new Schema(
  {
    storageKey: { type: String, required: true },
  },
  { _id: false },
);

const hubPostSchema = new Schema(
  {
    hubId: { type: Schema.Types.ObjectId, ref: "Hub", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    images: { type: [hubPostImageSchema], default: [] },
  },
  { timestamps: true },
);

hubPostSchema.index({ hubId: 1, createdAt: -1 });

export type HubPost = InferSchemaType<typeof hubPostSchema>;

export const HubPostModel = model("HubPost", hubPostSchema);
