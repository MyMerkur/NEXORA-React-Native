import * as subscriptionRepo from "../repositories/subscription.repository";
import * as subscriptionService from "./subscription.service";
import * as hubService from "./hub.service";
import type { SubscriptionWebhookPayload } from "./subscription.service";

// Single merchant-wide iyzico webhook route serves two independent domains: the app-wide
// Subscription collection (teaser_monthly/clinic_premium_monthly) and per-Hub HubMembership
// records (Nexora Hubs). Dispatch by looking up which collection actually owns the
// subscriptionReferenceCode BEFORE calling into either handler, so only one handler ever
// processes a given event — no shared-dedupeKey collision between the two domains.
export async function routeSubscriptionWebhook(signatureHeader: string, payload: SubscriptionWebhookPayload): Promise<void> {
  const subscription = await subscriptionRepo.findByIyzicoSubscriptionReferenceCode(payload.subscriptionReferenceCode);
  if (subscription) {
    await subscriptionService.handleSubscriptionWebhook(signatureHeader, payload);
    return;
  }
  await hubService.handleHubMembershipWebhook(signatureHeader, payload);
}
