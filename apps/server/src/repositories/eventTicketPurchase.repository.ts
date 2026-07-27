import { Types } from "mongoose";
import { EventTicketPurchaseModel } from "../models/EventTicketPurchase";

export async function create(data: {
  eventId: string;
  ticketTypeId: string;
  userId: string;
  checkoutConversationId: string;
  price: string;
}) {
  return EventTicketPurchaseModel.create({
    eventId: new Types.ObjectId(data.eventId),
    ticketTypeId: new Types.ObjectId(data.ticketTypeId),
    userId: new Types.ObjectId(data.userId),
    checkoutConversationId: data.checkoutConversationId,
    price: data.price,
  });
}

export async function setCheckoutToken(id: string, checkoutToken: string) {
  return EventTicketPurchaseModel.findByIdAndUpdate(id, { $set: { checkoutToken } }, { new: true });
}

export async function findByCheckoutToken(token: string) {
  return EventTicketPurchaseModel.findOne({ checkoutToken: token });
}

export async function markPaidIfPending(id: string, iyzicoPaymentId: string, verificationCode: string) {
  return EventTicketPurchaseModel.findOneAndUpdate(
    { _id: id, status: "pending_checkout" },
    { $set: { status: "paid", iyzicoPaymentId, verificationCode } },
    { new: true },
  );
}

export async function markFailedIfPending(id: string) {
  return EventTicketPurchaseModel.findOneAndUpdate(
    { _id: id, status: "pending_checkout" },
    { $set: { status: "failed" } },
    { new: true },
  );
}

export async function findByVerificationCode(code: string) {
  return EventTicketPurchaseModel.findOne({ verificationCode: code }).populate("userId eventId");
}

export async function markCheckedIn(id: string) {
  return EventTicketPurchaseModel.findByIdAndUpdate(id, { $set: { checkedInAt: new Date() } }, { new: true });
}

export async function listByUser(userId: string) {
  return EventTicketPurchaseModel.find({ userId: new Types.ObjectId(userId), status: "paid" })
    .populate("eventId")
    .sort({ createdAt: -1 });
}

export async function listByEvent(eventId: string) {
  return EventTicketPurchaseModel.find({ eventId: new Types.ObjectId(eventId), status: "paid" })
    .populate("userId")
    .sort({ createdAt: -1 });
}

