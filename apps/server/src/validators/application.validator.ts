import { z } from "zod";

export const applySchema = z
  .object({
    message: z.string().max(1000).optional(),
  })
  .strict();

export const applicationStatusSchema = z
  .object({
    status: z.enum(["accepted", "rejected"]),
  })
  .strict();
