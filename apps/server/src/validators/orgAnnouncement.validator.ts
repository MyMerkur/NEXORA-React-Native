import { z } from "zod";

export const createAnnouncementSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    body: z.string().trim().min(1).max(1000),
  })
  .strict();
