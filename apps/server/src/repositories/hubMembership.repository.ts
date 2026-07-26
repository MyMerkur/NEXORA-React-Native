import { Types } from "mongoose";
import { HubMembershipModel, type HubMembershipStatus } from "../models/HubMembership";

export async function create(data: { hubId: string; userId: string; checkoutConversationId: string }) {
  return HubMembershipModel.create({
    hubId: new Types.ObjectId(data.hubId),
    userId: new Types.ObjectId(data.userId),
    checkoutConversationId: data.checkoutConversationId,
  });
}

export async function createActive(data: { hubId: string; userId: string }) {
  return HubMembershipModel.create({
    hubId: new Types.ObjectId(data.hubId),
    userId: new Types.ObjectId(data.userId),
    status: "active",
  });
}

export async function findLatestByHubAndUser(hubId: string, userId: string) {
  return HubMembershipModel.findOne({
    hubId: new Types.ObjectId(hubId),
    userId: new Types.ObjectId(userId),
  }).sort({ createdAt: -1 });
}

export async function findByCheckoutToken(token: string) {
  return HubMembershipModel.findOne({ checkoutToken: token });
}

export async function findByIyzicoSubscriptionReferenceCode(referenceCode: string) {
  return HubMembershipModel.findOne({ iyzicoSubscriptionReferenceCode: referenceCode });
}

export async function setCheckoutToken(id: string, checkoutToken: string) {
  return HubMembershipModel.findByIdAndUpdate(id, { $set: { checkoutToken } }, { new: true });
}

export async function updateStatus(
  id: string,
  data: Partial<{
    status: HubMembershipStatus;
    iyzicoCustomerReferenceCode: string;
    iyzicoSubscriptionReferenceCode: string;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    canceledAt: Date | null;
    cancelReason: string;
    lastPaymentFailureReason: string;
  }>,
) {
  return HubMembershipModel.findByIdAndUpdate(id, { $set: data }, { new: true });
}

export async function listActiveByUser(userId: string) {
  return HubMembershipModel.find({ userId: new Types.ObjectId(userId), status: "active" }).sort({ createdAt: -1 });
}
