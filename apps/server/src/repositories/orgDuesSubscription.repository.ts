import { Types } from "mongoose";
import { OrgDuesSubscriptionModel, type OrgDuesSubscriptionStatus } from "../models/OrgDuesSubscription";

export async function create(data: { orgId: string; userId: string; checkoutConversationId: string }) {
  return OrgDuesSubscriptionModel.create({
    orgId: new Types.ObjectId(data.orgId),
    userId: new Types.ObjectId(data.userId),
    checkoutConversationId: data.checkoutConversationId,
  });
}

export async function findLatestByOrgAndUser(orgId: string, userId: string) {
  return OrgDuesSubscriptionModel.findOne({
    orgId: new Types.ObjectId(orgId),
    userId: new Types.ObjectId(userId),
  }).sort({ createdAt: -1 });
}

export async function findByCheckoutToken(token: string) {
  return OrgDuesSubscriptionModel.findOne({ checkoutToken: token });
}

export async function findByIyzicoSubscriptionReferenceCode(referenceCode: string) {
  return OrgDuesSubscriptionModel.findOne({ iyzicoSubscriptionReferenceCode: referenceCode });
}

export async function setCheckoutToken(id: string, checkoutToken: string) {
  return OrgDuesSubscriptionModel.findByIdAndUpdate(id, { $set: { checkoutToken } }, { new: true });
}

export async function updateStatus(
  id: string,
  data: Partial<{
    status: OrgDuesSubscriptionStatus;
    iyzicoCustomerReferenceCode: string;
    iyzicoSubscriptionReferenceCode: string;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    canceledAt: Date | null;
    cancelReason: string;
    lastPaymentFailureReason: string;
  }>,
) {
  return OrgDuesSubscriptionModel.findByIdAndUpdate(id, { $set: data }, { new: true });
}

export async function listByOrg(orgId: string) {
  return OrgDuesSubscriptionModel.find({ orgId: new Types.ObjectId(orgId) })
    .sort({ createdAt: -1 })
    .populate("userId", "email showcase.displayName showcase.avatarKey");
}
