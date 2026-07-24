import { z } from "zod";

export const rateOrgSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
  })
  .strict();
