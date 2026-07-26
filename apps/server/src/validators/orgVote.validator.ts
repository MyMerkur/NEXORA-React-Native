import { z } from "zod";

export const createVoteSchema = z
  .object({
    question: z.string().trim().min(1).max(300),
    options: z.array(z.string().trim().min(1).max(150)).min(2).max(10),
  })
  .strict();

export const castBallotSchema = z
  .object({
    optionIndex: z.number().int().min(0),
  })
  .strict();
