import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { env } from "./env";

export class IyzicoNotConfiguredError extends Error {}

export function isIyzicoConfigured(): boolean {
  return Boolean(env.IYZICO_API_KEY && env.IYZICO_SECRET_KEY && env.IYZICO_MERCHANT_ID);
}

export function ensureIyzicoConfigured(): void {
  if (!isIyzicoConfigured()) {
    throw new IyzicoNotConfiguredError("iyzico yapılandırılmamış");
  }
}

export const iyzicoConfig = {
  get baseUrl() {
    return env.IYZICO_BASE_URL;
  },
  get callbackUrl() {
    return env.IYZICO_CALLBACK_URL;
  },
  get pricingPlanReferenceCode() {
    return env.IYZICO_PRICING_PLAN_REFERENCE_CODE;
  },
  get clinicPremiumPricingPlanReferenceCode() {
    return env.IYZICO_CLINIC_PREMIUM_PRICING_PLAN_REFERENCE_CODE;
  },
  get jobCreditPrice() {
    return env.IYZICO_JOB_CREDIT_PRICE;
  },
  get jobCreditCallbackUrl() {
    return env.IYZICO_JOB_CREDIT_CALLBACK_URL;
  },
  get hubMembershipCallbackUrl() {
    return env.IYZICO_HUB_MEMBERSHIP_CALLBACK_URL;
  },
};

function generateRandomKey(): string {
  return `${Date.now()}${randomBytes(8).toString("hex")}`;
}

/**
 * iyzico v2 (Subscription API) HMAC-SHA256 auth scheme.
 * Authorization: "IYZWSv2 " + base64("apiKey:<apiKey>&randomKey:<randomKey>&signature:<hmac>")
 * hmac = HMACSHA256(randomKey + uriPath [+ requestBody if non-empty], secretKey)
 */
export function buildAuthorizationHeaders(uriPath: string, requestBody: string): Record<string, string> {
  ensureIyzicoConfigured();
  const randomKey = generateRandomKey();
  const payload = requestBody ? randomKey + uriPath + requestBody : randomKey + uriPath;
  const signature = createHmac("sha256", env.IYZICO_SECRET_KEY).update(payload).digest("hex");
  const authorizationString = `apiKey:${env.IYZICO_API_KEY}&randomKey:${randomKey}&signature:${signature}`;
  const base64 = Buffer.from(authorizationString, "utf8").toString("base64");
  return {
    Authorization: `IYZWSv2 ${base64}`,
    "x-iyzi-rnd": randomKey,
  };
}

/**
 * Verifies the X-IYZ-SIGNATURE-V3 header for subscription webhook events.
 * expected = HMACSHA256(merchantId + secretKey + eventType + subscriptionReferenceCode + orderReferenceCode + customerReferenceCode, secretKey)
 */
export function verifyWebhookSignature(params: {
  signatureHeader: string;
  eventType: string;
  subscriptionReferenceCode: string;
  orderReferenceCode: string;
  customerReferenceCode: string;
}): boolean {
  if (!isIyzicoConfigured() || !params.signatureHeader) {
    return false;
  }
  const message =
    env.IYZICO_MERCHANT_ID +
    env.IYZICO_SECRET_KEY +
    params.eventType +
    params.subscriptionReferenceCode +
    params.orderReferenceCode +
    params.customerReferenceCode;
  const expectedHex = createHmac("sha256", env.IYZICO_SECRET_KEY).update(message).digest("hex");

  const expectedBuffer = Buffer.from(expectedHex, "hex");
  let actualBuffer: Buffer;
  try {
    actualBuffer = Buffer.from(params.signatureHeader, "hex");
  } catch {
    return false;
  }
  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, actualBuffer);
}
