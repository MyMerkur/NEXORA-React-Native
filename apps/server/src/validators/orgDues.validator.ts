import { z } from "zod";
import { ORG_DUES_PAYMENT_INTERVALS } from "../models/OrgDuesPlan";

export const createDuesPlanSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    price: z.string().trim().min(1).max(20),
    paymentInterval: z.enum(ORG_DUES_PAYMENT_INTERVALS),
  })
  .strict();

export const duesCheckoutSchema = z
  .object({
    identityNumber: z.string().trim().length(11).optional(),
    phone: z.string().trim().min(10).max(20).optional(),
    address: z.string().trim().min(1).max(300).optional(),
    city: z.string().trim().min(1).max(100).optional(),
    country: z.string().trim().min(1).max(100).optional(),
    zipCode: z.string().trim().max(20).optional(),
  })
  .strict();
