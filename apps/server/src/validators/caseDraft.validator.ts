import { z } from "zod";

export const generateCaseDraftSchema = z
  .object({
    storageKeys: z.array(z.string().min(1)).min(1).max(9),
    captionText: z.string().max(2000).optional(),
  })
  .strict();
