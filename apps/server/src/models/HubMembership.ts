import { Schema, model, type InferSchemaType } from "mongoose";

export const HUB_MEMBERSHIP_STATUSES = ["pending_checkout", "active", "past_due", "canceled", "expired"] as const;
export type HubMembershipStatus = (typeof HUB_MEMBERSHIP_STATUSES)[number];

const hubMembershipSchema = new Schema(
  {
    hubId: { type: Schema.Types.ObjectId, ref: "Hub", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: HUB_MEMBERSHIP_STATUSES, default: "pending_checkout" },
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

hubMembershipSchema.index({ hubId: 1, userId: 1, createdAt: -1 });
hubMembershipSchema.index({ userId: 1, createdAt: -1 });
hubMembershipSchema.index({ iyzicoSubscriptionReferenceCode: 1 }, { sparse: true });
hubMembershipSchema.index({ checkoutToken: 1 }, { sparse: true });

export type HubMembership = InferSchemaType<typeof hubMembershipSchema>;

export const HubMembershipModel = model("HubMembership", hubMembershipSchema);
