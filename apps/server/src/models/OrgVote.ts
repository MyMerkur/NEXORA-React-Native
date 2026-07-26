import { Schema, model, type InferSchemaType } from "mongoose";

export const ORG_VOTE_STATUSES = ["open", "closed"] as const;
export type OrgVoteStatus = (typeof ORG_VOTE_STATUSES)[number];

const orgVoteSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true, trim: true, maxlength: 300 },
    options: { type: [String], required: true },
    status: { type: String, enum: ORG_VOTE_STATUSES, default: "open" },
  },
  { timestamps: true },
);

orgVoteSchema.index({ orgId: 1, createdAt: -1 });

export type OrgVote = InferSchemaType<typeof orgVoteSchema>;

export const OrgVoteModel = model("OrgVote", orgVoteSchema);
