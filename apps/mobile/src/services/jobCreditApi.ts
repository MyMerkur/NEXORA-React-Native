import { apiClient } from "./authApi";
import type { BillingInfoInput } from "./subscriptionApi";

export interface JobCreditCheckoutSession {
  purchaseId: string;
  token: string;
  checkoutFormContent: string;
}

export async function startJobCreditCheckout(
  billingInfo: BillingInfoInput = {},
): Promise<JobCreditCheckoutSession> {
  const { data } = await apiClient.post<JobCreditCheckoutSession>("/api/v1/job-credits/checkout", billingInfo);
  return data;
}

export async function getJobCreditBalance(): Promise<{ balance: number }> {
  const { data } = await apiClient.get<{ balance: number }>("/api/v1/job-credits/balance");
  return data;
}
