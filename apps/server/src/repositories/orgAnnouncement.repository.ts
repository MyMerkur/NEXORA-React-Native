import { Types } from "mongoose";
import { OrgAnnouncementModel } from "../models/OrgAnnouncement";

export async function create(data: { orgId: string; title: string; body: string }) {
  return OrgAnnouncementModel.create({
    orgId: new Types.ObjectId(data.orgId),
    title: data.title,
    body: data.body,
  });
}

export async function listByOrg(orgId: string) {
  return OrgAnnouncementModel.find({ orgId: new Types.ObjectId(orgId) }).sort({ createdAt: -1 });
}
