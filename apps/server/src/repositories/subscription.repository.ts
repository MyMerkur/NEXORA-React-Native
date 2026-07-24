import { Types } from "mongoose";
import { SubscriptionModel, type SubscriptionStatus, type SubscriptionPlanCode } from "../models/Subscription";

export async function create(data: { userId: string; planCode: SubscriptionPlanCode; checkoutConversationId: string }) {
  return SubscriptionModel.create({
    userId: new Types.ObjectId(data.userId),
    planCode: data.planCode,
    checkoutConversationId: data.checkoutConversationId,
  });
}

export async function findLatestByUser(userId: string) {
  return SubscriptionModel.findOne({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
}

export async function findByCheckoutToken(token: string) {
  return SubscriptionModel.findOne({ checkoutToken: token });
}

export async function findByIyzicoSubscriptionReferenceCode(referenceCode: string) {
  return SubscriptionModel.findOne({ iyzicoSubscriptionReferenceCode: referenceCode });
}

export async function setCheckoutToken(id: string, checkoutToken: string) {
  return SubscriptionModel.findByIdAndUpdate(id, { $set: { checkoutToken } }, { new: true });
}

export async function updateStatus(
  id: string,
  data: Partial<{
    status: SubscriptionStatus;
    iyzicoCustomerReferenceCode: string;
    iyzicoSubscriptionReferenceCode: string;
    iyzicoPricingPlanReferenceCode: string;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    canceledAt: Date | null;
    cancelReason: string;
    lastPaymentFailureReason: string;
  }>,
) {
  return SubscriptionModel.findByIdAndUpdate(id, { $set: data }, { new: true });
}
