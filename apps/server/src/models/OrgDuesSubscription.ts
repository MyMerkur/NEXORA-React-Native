import { Schema, model, type InferSchemaType } from "mongoose";

export const ORG_DUES_SUBSCRIPTION_STATUSES = ["pending_checkout", "active", "past_due", "canceled", "expired"] as const;
export type OrgDuesSubscriptionStatus = (typeof ORG_DUES_SUBSCRIPTION_STATUSES)[number];

const orgDuesSubscriptionSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ORG_DUES_SUBSCRIPTION_STATUSES, default: "pending_checkout" },
    checkoutToken: { type: String, default: "" },
    checkoutConversationId: { type: String, default: "" },
    iyzicoCustomerReferenceCode: { type: String, default: "" },
    iyzicoSubscriptionReferenceCode: { type: String, default: "" },
    currentPeriodStart: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },
    canceledAt: { type: Date, default: null },
    cancelReason: { type: String, default: "" },
    lastPaymentFailureReason: { type: String, default: "" },
  },
  { timestamps: true },
);

orgDuesSubscriptionSchema.index({ orgId: 1, userId: 1, createdAt: -1 });
orgDuesSubscriptionSchema.index({ userId: 1, createdAt: -1 });
orgDuesSubscriptionSchema.index({ iyzicoSubscriptionReferenceCode: 1 }, { sparse: true });
orgDuesSubscriptionSchema.index({ checkoutToken: 1 }, { sparse: true });

export type OrgDuesSubscription = InferSchemaType<typeof orgDuesSubscriptionSchema>;

export const OrgDuesSubscriptionModel = model("OrgDuesSubscription", orgDuesSubscriptionSchema);
