import { z } from "zod";
import { SUBSCRIPTION_PLAN_CODES } from "../models/Subscription";

export const startCheckoutSchema = z
  .object({
    planCode: z.enum(SUBSCRIPTION_PLAN_CODES),
    identityNumber: z.string().trim().length(11).optional(),
    phone: z.string().trim().min(10).max(20).optional(),
    address: z.string().trim().min(1).max(300).optional(),
    city: z.string().trim().min(1).max(100).optional(),
    country: z.string().trim().min(1).max(100).optional(),
    zipCode: z.string().trim().max(20).optional(),
  })
  .strict();
