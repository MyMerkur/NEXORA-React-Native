import { Types } from "mongoose";
import { PaymentEventModel, type PaymentEventSource, type PaymentEventResult } from "../models/PaymentEvent";

export async function create(data: {
  dedupeKey: string;
  source: PaymentEventSource;
  eventType: string;
  subscriptionId?: string | null;
  iyzicoSubscriptionReferenceCode?: string;
  iyzicoOrderReferenceCode?: string;
}) {
  return PaymentEventModel.create({
    dedupeKey: data.dedupeKey,
    source: data.source,
    eventType: data.eventType,
    subscriptionId: data.subscriptionId ? new Types.ObjectId(data.subscriptionId) : null,
    iyzicoSubscriptionReferenceCode: data.iyzicoSubscriptionReferenceCode ?? "",
    iyzicoOrderReferenceCode: data.iyzicoOrderReferenceCode ?? "",
  });
}

export async function findByDedupeKey(dedupeKey: string) {
  return PaymentEventModel.findOne({ dedupeKey });
}

export async function markResult(id: string, resultStatus: PaymentEventResult, errorMessage = "") {
  return PaymentEventModel.findByIdAndUpdate(
    id,
    { $set: { resultStatus, errorMessage, processedAt: new Date() } },
    { new: true },
  );
}
