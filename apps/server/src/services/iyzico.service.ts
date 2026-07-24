import { env } from "../config/env";
import { buildAuthorizationHeaders, ensureIyzicoConfigured } from "../config/iyzico";
import { HttpError } from "../utils/httpError";
import { logger } from "../utils/logger";

export interface IyzicoCustomer {
  name: string;
  surname: string;
  email: string;
  gsmNumber: string;
  identityNumber: string;
  billingAddress: {
    address: string;
    contactName: string;
    city: string;
    country: string;
    zipCode?: string;
  };
}

export interface InitializeCheckoutParams {
  conversationId: string;
  pricingPlanReferenceCode: string;
  callbackUrl: string;
  customer: IyzicoCustomer;
}

export interface InitializeCheckoutResult {
  token: string;
  checkoutFormContent: string;
  tokenExpireTime: number;
}

export interface CheckoutFormResult {
  status: string;
  referenceCode: string | null;
  subscriptionStatus: string | null;
  customerReferenceCode: string | null;
}

export interface SubscriptionDetailsResult {
  referenceCode: string;
  subscriptionStatus: string;
  startDate: string | null;
  endDate: string | null;
  customerReferenceCode: string | null;
}

type IyzicoEnvelope<T> = { status?: string; errorCode?: string; errorMessage?: string; data?: T } & Partial<T>;

async function iyzicoRequest<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  ensureIyzicoConfigured();
  const requestBody = body ? JSON.stringify(body) : "";
  const authHeaders = buildAuthorizationHeaders(path, requestBody);

  let response: Response;
  try {
    response = await fetch(`${env.IYZICO_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...authHeaders,
      },
      body: requestBody || undefined,
    });
  } catch (error) {
    logger.error("iyzico.request.network_error", {
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new HttpError("Ödeme sağlayıcısına ulaşılamadı", 502);
  }

  const json = (await response.json().catch(() => null)) as IyzicoEnvelope<T> | null;

  if (!response.ok || !json || json.status === "failure") {
    logger.error("iyzico.request.failed", {
      path,
      httpStatus: response.status,
      errorCode: json?.errorCode,
    });
    throw new HttpError("Ödeme sağlayıcısı isteği başarısız", 502);
  }

  return (json.data ?? json) as T;
}

export async function initializeSubscriptionCheckout(params: InitializeCheckoutParams): Promise<InitializeCheckoutResult> {
  return iyzicoRequest<InitializeCheckoutResult>("POST", "/v2/subscription/checkoutform/initialize", {
    locale: "tr",
    conversationId: params.conversationId,
    pricingPlanReferenceCode: params.pricingPlanReferenceCode,
    subscriptionInitialStatus: "ACTIVE",
    callbackUrl: params.callbackUrl,
    customer: params.customer,
  });
}

export async function retrieveCheckoutFormResult(token: string): Promise<CheckoutFormResult> {
  return iyzicoRequest<CheckoutFormResult>("GET", `/v2/subscription/checkoutform/${encodeURIComponent(token)}`);
}

export async function getSubscriptionDetails(subscriptionReferenceCode: string): Promise<SubscriptionDetailsResult> {
  return iyzicoRequest<SubscriptionDetailsResult>(
    "GET",
    `/v2/subscription/subscriptions/${encodeURIComponent(subscriptionReferenceCode)}`,
  );
}

export async function cancelIyzicoSubscription(subscriptionReferenceCode: string): Promise<void> {
  await iyzicoRequest<unknown>("POST", `/v2/subscription/subscriptions/${encodeURIComponent(subscriptionReferenceCode)}/cancel`);
}
