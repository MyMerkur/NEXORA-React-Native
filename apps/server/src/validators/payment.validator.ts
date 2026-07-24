import { z } from "zod";

// iyzico's checkout callback is a redirect-post-back we don't own the full shape of;
// we only extract the token and re-query iyzico for the authoritative result.
export const checkoutCallbackSchema = z
  .object({
    token: z.string().min(1).max(200),
  })
  .passthrough();

export const subscriptionWebhookSchema = z.object({
  orderReferenceCode: z.string().min(1),
  customerReferenceCode: z.string().min(1),
  subscriptionReferenceCode: z.string().min(1),
  iyziReferenceCode: z.string().min(1),
  iyziEventType: z.string().min(1),
});
