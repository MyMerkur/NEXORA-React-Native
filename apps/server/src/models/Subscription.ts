import { Schema, model, type InferSchemaType } from "mongoose";

export const SUBSCRIPTION_PLAN_CODES = ["teaser_monthly", "clinic_premium_monthly"] as const;
export type SubscriptionPlanCode = (typeof SUBSCRIPTION_PLAN_CODES)[number];

export const SUBSCRIPTION_STATUSES = ["pending_checkout", "active", "past_due", "canceled", "expired"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

const subscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planCode: { type: String, enum: SUBSCRIPTION_PLAN_CODES, required: true },
    status: { type: String, enum: SUBSCRIPTION_STATUSES, default: "pending_checkout" },
    iyzicoCustomerReferenceCode: { type: String, default: "" },
    iyzicoSubscriptionReferenceCode: { type: String, default: "" },
    iyzicoPricingPlanReferenceCode: { type: String, default: "" },
    checkoutToken: { type: String, default: "" },
    checkoutConversationId: { type: String, default: "" },
    currentPeriodStart: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },
    canceledAt: { type: Date, default: null },
    cancelReason: { type: String, default: "" },
    lastPaymentFailureReason: { type: String, default: "" },
  },
  { timestamps: true },
);

subscriptionSchema.index({ userId: 1, createdAt: -1 });
subscriptionSchema.index({ iyzicoSubscriptionReferenceCode: 1 }, { sparse: true });
subscriptionSchema.index({ checkoutToken: 1 }, { sparse: true });

export type Subscription = InferSchemaType<typeof subscriptionSchema>;

export const SubscriptionModel = model("Subscription", subscriptionSchema);
