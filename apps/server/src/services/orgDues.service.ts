import { randomUUID } from "crypto";
import * as orgDuesPlanRepo from "../repositories/orgDuesPlan.repository";
import * as orgDuesSubscriptionRepo from "../repositories/orgDuesSubscription.repository";
import { findUserById } from "../repositories/user.repository";
import * as iyzicoService from "./iyzico.service";
import { iyzicoConfig, verifyWebhookSignature } from "../config/iyzico";
import { resolveBillingInfo, processIdempotent, mapIyzicoStatus, type SubscriptionWebhookPayload } from "./subscription.service";
import { resolveUserSummary, type UserSummarySource } from "../utils/userSummary";
import {
  notifyOrgDuesActivated,
  notifyOrgDuesRenewed,
  notifyOrgDuesPaymentFailed,
  notifyOrgDuesCanceled,
} from "./notification.service";
import { HttpError } from "../utils/httpError";
import type { OrgDuesPaymentInterval } from "../models/OrgDuesPlan";

interface BillingInfoInput {
  identityNumber?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
}

async function requireDernekOwner(userId: string, orgId: string) {
  if (userId !== orgId) {
    throw new HttpError("Bu işlem için derneğin sahibi olmalısınız", 403);
  }
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError("Kullanıcı bulunamadı", 404);
  }
  if (user.role !== "dernek") {
    throw new HttpError("Bu özellik sadece dernek hesapları için kullanılabilir", 403);
  }
  if (user.kycLevel < 3) {
    throw new HttpError("Bu özellik için kurumsal doğrulama (Level 3) gerekli", 403);
  }
  return user;
}

async function requireOrgMember(userId: string, orgId: string) {
  if (userId === orgId) {
    return;
  }
  const user = await findUserById(userId);
  if (!user || user.affiliatedOrgId?.toString() !== orgId) {
    throw new HttpError("Bu içeriğe erişmek için derneğe üye olmalısınız", 403);
  }
}

function serializePlan(plan: {
  _id: { toString(): string };
  orgId: { toString(): string };
  name: string;
  price: string;
  paymentInterval: OrgDuesPaymentInterval;
  createdAt: Date;
}) {
  return {
    id: plan._id.toString(),
    orgId: plan.orgId.toString(),
    name: plan.name,
    price: plan.price,
    paymentInterval: plan.paymentInterval,
    createdAt: plan.createdAt,
  };
}

export async function createDuesPlan(
  userId: string,
  orgId: string,
  input: { name?: string; price: string; paymentInterval: OrgDuesPaymentInterval },
) {
  await requireDernekOwner(userId, orgId);

  const existing = await orgDuesPlanRepo.findByOrg(orgId);
  if (existing) {
    throw new HttpError("Bu derneğin zaten bir aidat planı var", 409);
  }

  const provisioned = await iyzicoService.createSubscriptionProductAndPlan({
    name: input.name ?? "Üyelik Aidatı",
    price: input.price,
    paymentInterval: input.paymentInterval,
  });

  const created = await orgDuesPlanRepo.create({
    orgId,
    name: input.name,
    price: input.price,
    paymentInterval: input.paymentInterval,
    iyzicoProductReferenceCode: provisioned.productReferenceCode,
    iyzicoPricingPlanReferenceCode: provisioned.pricingPlanReferenceCode,
  });

  return serializePlan(created);
}

export async function getDuesPlan(userId: string, orgId: string) {
  await requireOrgMember(userId, orgId);
  const plan = await orgDuesPlanRepo.findByOrg(orgId);
  return plan ? serializePlan(plan) : null;
}

export async function startDuesCheckout(userId: string, orgId: string, billingInfo: BillingInfoInput) {
  await requireOrgMember(userId, orgId);

  const plan = await orgDuesPlanRepo.findByOrg(orgId);
  if (!plan) {
    throw new HttpError("Bu derneğin aidat planı henüz oluşturulmamış", 404);
  }

  const existing = await orgDuesSubscriptionRepo.findLatestByOrgAndUser(orgId, userId);
  if (existing?.status === "active") {
    throw new HttpError("Zaten aktif bir aidat üyeliğiniz var", 409);
  }

  const { user, merged } = await resolveBillingInfo(userId, billingInfo);

  const subscription = await orgDuesSubscriptionRepo.create({
    orgId,
    userId,
    checkoutConversationId: randomUUID(),
  });

  const displayName = user.showcase.displayName || user.email;
  const [name, ...rest] = displayName.trim().split(/\s+/);
  const surname = rest.length > 0 ? rest.join(" ") : "Kullanıcı";

  let checkout;
  try {
    checkout = await iyzicoService.initializeSubscriptionCheckout({
      conversationId: subscription._id.toString(),
      pricingPlanReferenceCode: plan.iyzicoPricingPlanReferenceCode,
      callbackUrl: iyzicoConfig.duesCallbackUrl,
      customer: {
        name: name || "Kullanıcı",
        surname,
        email: user.email,
        gsmNumber: merged.phone,
        identityNumber: merged.identityNumber,
        billingAddress: {
          address: merged.address,
          contactName: displayName,
          city: merged.city,
          country: merged.country,
          zipCode: merged.zipCode,
        },
      },
    });
  } catch (error) {
    await orgDuesSubscriptionRepo.updateStatus(subscription._id.toString(), {
      status: "canceled",
      cancelReason: "checkout_init_failed",
    });
    throw error;
  }

  await orgDuesSubscriptionRepo.setCheckoutToken(subscription._id.toString(), checkout.token);

  return {
    subscriptionId: subscription._id.toString(),
    token: checkout.token,
    checkoutFormContent: checkout.checkoutFormContent,
  };
}

export async function handleDuesCallback(token: string): Promise<void> {
  await processIdempotent({
    dedupeKey: `dues-callback:${token}`,
    source: "checkout_callback",
    eventType: "org_dues.checkout.callback",
    process: async () => {
      const subscription = await orgDuesSubscriptionRepo.findByCheckoutToken(token);
      if (!subscription) {
        throw new HttpError("Üyelik kaydı bulunamadı", 404);
      }

      const result = await iyzicoService.retrieveCheckoutFormResult(token);

      if (result.status === "success" && result.subscriptionStatus === "ACTIVE" && result.referenceCode) {
        const details = await iyzicoService.getSubscriptionDetails(result.referenceCode);
        await orgDuesSubscriptionRepo.updateStatus(subscription._id.toString(), {
          status: "active",
          iyzicoSubscriptionReferenceCode: result.referenceCode,
          iyzicoCustomerReferenceCode: result.customerReferenceCode ?? "",
          currentPeriodStart: details.startDate ? new Date(details.startDate) : new Date(),
          currentPeriodEnd: details.endDate ? new Date(details.endDate) : null,
        });
        const org = await findUserById(subscription.orgId.toString());
        await notifyOrgDuesActivated(subscription.userId.toString(), org?.showcase.displayName || org?.email || "Dernek");
      } else {
        await orgDuesSubscriptionRepo.updateStatus(subscription._id.toString(), {
          status: "canceled",
          cancelReason: "checkout_failed",
        });
      }
    },
  });
}

export async function handleDuesWebhook(signatureHeader: string, payload: SubscriptionWebhookPayload): Promise<void> {
  const verified = verifyWebhookSignature({
    signatureHeader,
    eventType: payload.iyziEventType,
    subscriptionReferenceCode: payload.subscriptionReferenceCode,
    orderReferenceCode: payload.orderReferenceCode,
    customerReferenceCode: payload.customerReferenceCode,
  });
  if (!verified) {
    throw new HttpError("Geçersiz webhook imzası", 401);
  }

  await processIdempotent({
    dedupeKey: `dues-webhook:${payload.iyziReferenceCode}`,
    source: "subscription_webhook",
    eventType: payload.iyziEventType,
    iyzicoSubscriptionReferenceCode: payload.subscriptionReferenceCode,
    iyzicoOrderReferenceCode: payload.orderReferenceCode,
    process: async () => {
      const subscription = await orgDuesSubscriptionRepo.findByIyzicoSubscriptionReferenceCode(
        payload.subscriptionReferenceCode,
      );
      if (!subscription) {
        return;
      }

      const details = await iyzicoService.getSubscriptionDetails(payload.subscriptionReferenceCode);
      const previousStatus = subscription.status;
      const nextStatus = mapIyzicoStatus(details.subscriptionStatus);

      await orgDuesSubscriptionRepo.updateStatus(subscription._id.toString(), {
        status: nextStatus,
        currentPeriodEnd: details.endDate ? new Date(details.endDate) : subscription.currentPeriodEnd,
        lastPaymentFailureReason:
          payload.iyziEventType === "subscription.order.failure" ? "payment_failed" : subscription.lastPaymentFailureReason,
      });

      if (nextStatus !== previousStatus) {
        const org = await findUserById(subscription.orgId.toString());
        const orgName = org?.showcase.displayName || org?.email || "Dernek";
        if (nextStatus === "active" && payload.iyziEventType === "subscription.order.success") {
          await notifyOrgDuesRenewed(subscription.userId.toString(), orgName);
        } else if (nextStatus === "past_due" || payload.iyziEventType === "subscription.order.failure") {
          await notifyOrgDuesPaymentFailed(subscription.userId.toString(), orgName);
        }
      }
    },
  });
}

export async function cancelDuesSubscription(userId: string, orgId: string) {
  const subscription = await orgDuesSubscriptionRepo.findLatestByOrgAndUser(orgId, userId);
  if (!subscription || subscription.status !== "active") {
    throw new HttpError("Aktif bir aidat üyeliğiniz yok", 404);
  }

  await iyzicoService.cancelIyzicoSubscription(subscription.iyzicoSubscriptionReferenceCode);
  await orgDuesSubscriptionRepo.updateStatus(subscription._id.toString(), {
    status: "canceled",
    canceledAt: new Date(),
    cancelReason: "user_requested",
  });

  const org = await findUserById(orgId);
  await notifyOrgDuesCanceled(userId, org?.showcase.displayName || org?.email || "Dernek");

  return { status: "canceled" as const };
}

export async function getMyDuesStatus(userId: string, orgId: string) {
  await requireOrgMember(userId, orgId);
  const subscription = await orgDuesSubscriptionRepo.findLatestByOrgAndUser(orgId, userId);
  return {
    status: subscription?.status ?? "none",
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
  };
}

export async function listDuesSubscribers(userId: string, orgId: string) {
  await requireDernekOwner(userId, orgId);

  const subscriptions = await orgDuesSubscriptionRepo.listByOrg(orgId);
  return Promise.all(
    subscriptions.map(async (subscription) => ({
      id: subscription._id.toString(),
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      member: await resolveUserSummary(subscription.userId as unknown as UserSummarySource),
    })),
  );
}
