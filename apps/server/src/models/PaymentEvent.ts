import { Schema, model, type InferSchemaType } from "mongoose";

export const PAYMENT_EVENT_SOURCES = ["checkout_callback", "subscription_webhook"] as const;
export type PaymentEventSource = (typeof PAYMENT_EVENT_SOURCES)[number];

export const PAYMENT_EVENT_RESULTS = ["processing", "applied", "duplicate_ignored", "error"] as const;
export type PaymentEventResult = (typeof PAYMENT_EVENT_RESULTS)[number];

const paymentEventSchema = new Schema(
  {
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription", default: null },
    source: { type: String, enum: PAYMENT_EVENT_SOURCES, required: true },
    eventType: { type: String, required: true, trim: true, maxlength: 100 },
    dedupeKey: { type: String, required: true, unique: true },
    iyzicoSubscriptionReferenceCode: { type: String, default: "" },
    iyzicoOrderReferenceCode: { type: String, default: "" },
    resultStatus: { type: String, enum: PAYMENT_EVENT_RESULTS, default: "processing" },
    errorMessage: { type: String, default: "" },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type PaymentEvent = InferSchemaType<typeof paymentEventSchema>;

export const PaymentEventModel = model("PaymentEvent", paymentEventSchema);
