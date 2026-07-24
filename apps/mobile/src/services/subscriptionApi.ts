import { apiClient } from "./authApi";

export type SubscriptionStatus = "none" | "pending_checkout" | "active" | "past_due" | "canceled" | "expired";

export interface SubscriptionSummary {
  status: SubscriptionStatus;
  planCode: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
}

export interface CheckoutSession {
  subscriptionId: string;
  token: string;
  checkoutFormContent: string;
}

export interface BillingInfoInput {
  identityNumber?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
}

export async function startCheckout(planCode: string, billingInfo: BillingInfoInput = {}): Promise<CheckoutSession> {
  const { data } = await apiClient.post<CheckoutSession>("/api/v1/subscriptions/checkout", { planCode, ...billingInfo });
  return data;
}

export async function getSubscriptionStatus(): Promise<SubscriptionSummary> {
  const { data } = await apiClient.get<SubscriptionSummary>("/api/v1/subscriptions/status");
  return data;
}

export async function cancelSubscription(): Promise<SubscriptionSummary> {
  const { data } = await apiClient.post<SubscriptionSummary>("/api/v1/subscriptions/cancel");
  return data;
}
