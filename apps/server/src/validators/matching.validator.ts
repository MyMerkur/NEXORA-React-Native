import { z } from "zod";
import { SWIPE_DIRECTIONS } from "../models/JobSwipe";

export const swipeSchema = z
  .object({
    direction: z.enum(SWIPE_DIRECTIONS),
  })
  .strict();
