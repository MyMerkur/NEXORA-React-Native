import { Schema, model, type InferSchemaType } from "mongoose";

export const ORG_DUES_PAYMENT_INTERVALS = ["MONTHLY", "YEARLY"] as const;
export type OrgDuesPaymentInterval = (typeof ORG_DUES_PAYMENT_INTERVALS)[number];

const orgDuesPlanSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, trim: true, maxlength: 100, default: "Üyelik Aidatı" },
    price: { type: String, required: true },
    paymentInterval: { type: String, enum: ORG_DUES_PAYMENT_INTERVALS, required: true },
    iyzicoProductReferenceCode: { type: String, default: "" },
    iyzicoPricingPlanReferenceCode: { type: String, default: "" },
  },
  { timestamps: true },
);

export type OrgDuesPlan = InferSchemaType<typeof orgDuesPlanSchema>;

export const OrgDuesPlanModel = model("OrgDuesPlan", orgDuesPlanSchema);
