import { z } from "zod";
import { THREAD_CONTEXT_TYPES } from "../models/Thread";

export const startThreadSchema = z
  .object({
    targetUserId: z.string().min(1),
    contextType: z.enum(THREAD_CONTEXT_TYPES).optional(),
    contextId: z.string().optional(),
  })
  .strict();

export const sendMessageSchema = z
  .object({
    body: z.string().min(1).max(2000),
  })
  .strict();

export const cursorQuerySchema = z.object({
  cursor: z.string().datetime().optional(),
});
