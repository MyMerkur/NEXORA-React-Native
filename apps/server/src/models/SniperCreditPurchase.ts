import { Schema, model, type InferSchemaType } from "mongoose";

export const SNIPER_CREDIT_PURCHASE_STATUSES = ["pending_checkout", "paid", "failed"] as const;
export type SniperCreditPurchaseStatus = (typeof SNIPER_CREDIT_PURCHASE_STATUSES)[number];

const sniperCreditPurchaseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: SNIPER_CREDIT_PURCHASE_STATUSES, default: "pending_checkout" },
    checkoutToken: { type: String, default: "" },
    checkoutConversationId: { type: String, default: "" },
    creditsGranted: { type: Number, default: 1 },
    price: { type: String, default: "" },
    iyzicoPaymentId: { type: String, default: "" },
  },
  { timestamps: true },
);

sniperCreditPurchaseSchema.index({ userId: 1, createdAt: -1 });
sniperCreditPurchaseSchema.index({ checkoutToken: 1 }, { sparse: true });

export type SniperCreditPurchase = InferSchemaType<typeof sniperCreditPurchaseSchema>;

export const SniperCreditPurchaseModel = model("SniperCreditPurchase", sniperCreditPurchaseSchema);
