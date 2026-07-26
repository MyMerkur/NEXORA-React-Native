import { Types } from "mongoose";
import { OrgDuesPlanModel, type OrgDuesPaymentInterval } from "../models/OrgDuesPlan";

export async function create(data: {
  orgId: string;
  name?: string;
  price: string;
  paymentInterval: OrgDuesPaymentInterval;
  iyzicoProductReferenceCode: string;
  iyzicoPricingPlanReferenceCode: string;
}) {
  return OrgDuesPlanModel.create({
    orgId: new Types.ObjectId(data.orgId),
    name: data.name,
    price: data.price,
    paymentInterval: data.paymentInterval,
    iyzicoProductReferenceCode: data.iyzicoProductReferenceCode,
    iyzicoPricingPlanReferenceCode: data.iyzicoPricingPlanReferenceCode,
  });
}

export async function findByOrg(orgId: string) {
  return OrgDuesPlanModel.findOne({ orgId: new Types.ObjectId(orgId) });
}
