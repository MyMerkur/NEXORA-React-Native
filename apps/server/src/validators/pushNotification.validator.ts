import { z } from "zod";
import { DEVICE_PLATFORMS } from "../models/DeviceToken";

export const registerDeviceTokenSchema = z
  .object({
    token: z.string().trim().min(1).max(4096),
    platform: z.enum(DEVICE_PLATFORMS),
  })
  .strict();
