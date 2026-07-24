import { z } from "zod";

export const requestReferenceSchema = z
  .object({
    targetUserId: z.string().min(1),
  })
  .strict();

export const writeReferenceSchema = z
  .object({
    targetUserId: z.string().min(1),
    relationship: z.string().max(160).optional(),
    body: z.string().min(1).max(1000),
  })
  .strict();

export const fulfillReferenceSchema = z
  .object({
    relationship: z.string().max(160).optional(),
    body: z.string().min(1).max(1000),
  })
  .strict();

export const referenceVisibilitySchema = z
  .object({
    hidden: z.boolean(),
  })
  .strict();
