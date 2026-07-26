import { Schema, model, type InferSchemaType } from "mongoose";

const orgAnnouncementSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

orgAnnouncementSchema.index({ orgId: 1, createdAt: -1 });

export type OrgAnnouncement = InferSchemaType<typeof orgAnnouncementSchema>;

export const OrgAnnouncementModel = model("OrgAnnouncement", orgAnnouncementSchema);
