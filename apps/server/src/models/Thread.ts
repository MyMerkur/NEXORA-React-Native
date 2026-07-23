import { Schema, model, type InferSchemaType } from "mongoose";

export const THREAD_CATEGORIES = ["job", "case", "general"] as const;
export type ThreadCategory = (typeof THREAD_CATEGORIES)[number];

export const THREAD_CONTEXT_TYPES = ["job", "case", "org"] as const;
export type ThreadContextType = (typeof THREAD_CONTEXT_TYPES)[number];

const threadSchema = new Schema(
  {
    participantIds: { type: [Schema.Types.ObjectId], ref: "User", required: true },
    participantsKey: { type: String, required: true, unique: true },
    category: { type: String, enum: THREAD_CATEGORIES, required: true },
    contextType: { type: String, enum: THREAD_CONTEXT_TYPES, default: null },
    contextId: { type: Schema.Types.ObjectId, default: null },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { timestamps: true },
);

threadSchema.index({ participantIds: 1, lastMessageAt: -1 });

export type Thread = InferSchemaType<typeof threadSchema>;

export const ThreadModel = model("Thread", threadSchema);

export function buildParticipantsKey(userIdA: string, userIdB: string): string {
  return [userIdA, userIdB].sort().join(":");
}
