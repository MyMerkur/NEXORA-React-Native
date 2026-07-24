import { z } from "zod";

export const createInviteSchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

export const acceptInviteSchema = z
  .object({
    token: z.string().min(1),
  })
  .strict();
