import { Schema, model, type InferSchemaType } from "mongoose";

const messageSchema = new Schema(
  {
    threadId: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, trim: true, maxlength: 2000, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageSchema.index({ threadId: 1, createdAt: 1 });

export type Message = InferSchemaType<typeof messageSchema>;

export const MessageModel = model("Message", messageSchema);
