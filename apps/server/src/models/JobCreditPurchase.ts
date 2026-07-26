import { Schema, model, type InferSchemaType } from "mongoose";

export const JOB_CREDIT_PURCHASE_STATUSES = ["pending_checkout", "paid", "failed"] as const;
export type JobCreditPurchaseStatus = (typeof JOB_CREDIT_PURCHASE_STATUSES)[number];

const jobCreditPurchaseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: JOB_CREDIT_PURCHASE_STATUSES, default: "pending_checkout" },
    checkoutToken: { type: String, default: "" },
    checkoutConversationId: { type: String, default: "" },
    creditsGranted: { type: Number, default: 1 },
    price: { type: String, default: "" },
    iyzicoPaymentId: { type: String, default: "" },
  },
  { timestamps: true },
);

jobCreditPurchaseSchema.index({ userId: 1, createdAt: -1 });
jobCreditPurchaseSchema.index({ checkoutToken: 1 }, { sparse: true });

export type JobCreditPurchase = InferSchemaType<typeof jobCreditPurchaseSchema>;

export const JobCreditPurchaseModel = model("JobCreditPurchase", jobCreditPurchaseSchema);
