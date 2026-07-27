import { z } from "zod";

export const sniperSearchQuerySchema = z
  .object({
    specialties: z.string().trim().optional(),
    city: z.string().trim().max(100).optional(),
    minExperienceYears: z.coerce.number().int().min(0).optional(),
    maxExperienceYears: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .strict();

export const sniperCreditCheckoutSchema = z
  .object({
    identityNumber: z.string().trim().length(11).optional(),
    phone: z.string().trim().min(10).max(20).optional(),
    address: z.string().trim().min(1).max(300).optional(),
    city: z.string().trim().min(1).max(100).optional(),
    country: z.string().trim().min(1).max(100).optional(),
    zipCode: z.string().trim().max(20).optional(),
  })
  .strict();
