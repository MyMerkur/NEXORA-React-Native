import { Types } from "mongoose";
import { SniperCreditPurchaseModel } from "../models/SniperCreditPurchase";

export async function create(data: { userId: string; checkoutConversationId: string; price: string }) {
  return SniperCreditPurchaseModel.create({
    userId: new Types.ObjectId(data.userId),
    checkoutConversationId: data.checkoutConversationId,
    price: data.price,
  });
}

export async function setCheckoutToken(id: string, checkoutToken: string) {
  return SniperCreditPurchaseModel.findByIdAndUpdate(id, { $set: { checkoutToken } }, { new: true });
}

export async function findByCheckoutToken(token: string) {
  return SniperCreditPurchaseModel.findOne({ checkoutToken: token });
}

export async function markPaidIfPending(id: string, iyzicoPaymentId: string) {
  return SniperCreditPurchaseModel.findOneAndUpdate(
    { _id: id, status: "pending_checkout" },
    { $set: { status: "paid", iyzicoPaymentId } },
    { new: true },
  );
}

export async function markFailedIfPending(id: string) {
  return SniperCreditPurchaseModel.findOneAndUpdate(
    { _id: id, status: "pending_checkout" },
    { $set: { status: "failed" } },
    { new: true },
  );
}
