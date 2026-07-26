import { Schema, model, type InferSchemaType } from "mongoose";

const orgVoteBallotSchema = new Schema(
  {
    voteId: { type: Schema.Types.ObjectId, ref: "OrgVote", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    optionIndex: { type: Number, required: true },
  },
  { timestamps: true },
);

orgVoteBallotSchema.index({ voteId: 1, userId: 1 }, { unique: true });

export type OrgVoteBallot = InferSchemaType<typeof orgVoteBallotSchema>;

export const OrgVoteBallotModel = model("OrgVoteBallot", orgVoteBallotSchema);
