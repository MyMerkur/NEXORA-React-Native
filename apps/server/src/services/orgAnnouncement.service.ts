import { findUserById, findByAffiliatedOrg } from "../repositories/user.repository";
import * as orgAnnouncementRepo from "../repositories/orgAnnouncement.repository";
import { notifyOrgAnnouncement } from "./notification.service";
import { HttpError } from "../utils/httpError";

async function requireDernekOwner(userId: string, orgId: string) {
  if (userId !== orgId) {
    throw new HttpError("Bu işlem için derneğin sahibi olmalısınız", 403);
  }
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError("Kullanıcı bulunamadı", 404);
  }
  if (user.role !== "dernek") {
    throw new HttpError("Bu özellik sadece dernek hesapları için kullanılabilir", 403);
  }
  return user;
}

async function requireOrgMember(userId: string, orgId: string) {
  if (userId === orgId) {
    return;
  }
  const user = await findUserById(userId);
  if (!user || user.affiliatedOrgId?.toString() !== orgId) {
    throw new HttpError("Bu içeriğe erişmek için derneğe üye olmalısınız", 403);
  }
}

function serializeAnnouncement(announcement: {
  _id: { toString(): string };
  orgId: { toString(): string };
  title: string;
  body: string;
  createdAt: Date;
}) {
  return {
    id: announcement._id.toString(),
    orgId: announcement.orgId.toString(),
    title: announcement.title,
    body: announcement.body,
    createdAt: announcement.createdAt,
  };
}

export async function createAnnouncement(userId: string, orgId: string, input: { title: string; body: string }) {
  const owner = await requireDernekOwner(userId, orgId);

  const created = await orgAnnouncementRepo.create({ orgId, title: input.title, body: input.body });

  const orgName = owner.showcase.displayName || owner.email;
  const members = await findByAffiliatedOrg(orgId);
  await Promise.all(members.map((member) => notifyOrgAnnouncement(member._id.toString(), orgName, input.title)));

  return serializeAnnouncement(created);
}

export async function listAnnouncements(userId: string, orgId: string) {
  await requireOrgMember(userId, orgId);
  const announcements = await orgAnnouncementRepo.listByOrg(orgId);
  return announcements.map(serializeAnnouncement);
}
