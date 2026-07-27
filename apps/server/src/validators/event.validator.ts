import { z } from "zod";

export const createEventSchema = z
  .object({
    title: z.string().trim().min(3).max(150),
    description: z.string().trim().max(3000).optional(),
    location: z.string().trim().max(200).optional(),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    ticketTypes: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(100),
          price: z.string().trim().min(1).max(20),
          capacity: z.coerce.number().int().min(1),
        }),
      )
      .min(1),
  })
  .strict();

export const ticketCheckoutSchema = z
  .object({
    ticketTypeId: z.string().min(1),
    identityNumber: z.string().trim().length(11).optional(),
    phone: z.string().trim().min(10).max(20).optional(),
    address: z.string().trim().min(1).max(300).optional(),
    city: z.string().trim().min(1).max(100).optional(),
    country: z.string().trim().min(1).max(100).optional(),
    zipCode: z.string().trim().max(20).optional(),
  })
  .strict();

export const checkInSchema = z
  .object({
    verificationCode: z.string().trim().min(1),
  })
  .strict();
