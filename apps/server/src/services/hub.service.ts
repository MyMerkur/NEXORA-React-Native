import { randomUUID } from "crypto";
import { Types } from "mongoose";
import * as hubRepo from "../repositories/hub.repository";
import * as hubMembershipRepo from "../repositories/hubMembership.repository";
import * as hubPostRepo from "../repositories/hubPost.repository";
import { findUserById } from "../repositories/user.repository";
import * as iyzicoService from "./iyzico.service";
import { iyzicoConfig, verifyWebhookSignature } from "../config/iyzico";
import { resolveBillingInfo, processIdempotent, mapIyzicoStatus, type SubscriptionWebhookPayload } from "./subscription.service";
import { buildStorageKey, createUploadUrl, createDownloadUrl } from "../config/storage";
import { resolveUserSummary, type UserSummarySource } from "../utils/userSummary";
import {
  notifyHubMembershipActivated,
  notifyHubMembershipRenewed,
  notifyHubMembershipPaymentFailed,
  notifyHubMembershipCanceled,
} from "./notification.service";
import { HttpError } from "../utils/httpError";
import type { Hub, HubType } from "../models/Hub";
import type { HubMembership } from "../models/HubMembership";

const HUB_CREATION_KYC_LEVEL = 1;
const PAID_HUB_CREATION_KYC_LEVEL = 4;

interface BillingInfoInput {
  identityNumber?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
}

interface CreateHubInput {
  name: string;
  description?: string;
  type: HubType;
  price?: string;
  specialties?: string[];
}

type HubDoc = Hub & { _id: Types.ObjectId; createdAt: Date };
type HubMembershipDoc = HubMembership & { _id: Types.ObjectId };

async function serializeHub(hub: HubDoc, userId?: string, isMemberOverride?: boolean) {
  const coverImageUrl = hub.coverImageKey ? await createDownloadUrl(hub.coverImageKey) : null;
  let isMember = isMemberOverride ?? false;
  if (isMemberOverride === undefined && userId) {
    const membership = await hubMembershipRepo.findLatestByHubAndUser(hub._id.toString(), userId);
    isMember = membership?.status === "active";
  }
  return {
    id: hub._id.toString(),
    name: hub.name,
    description: hub.description,
    coverImageUrl,
    ownerId: hub.ownerId.toString(),
    isOwner: userId ? hub.ownerId.toString() === userId : false,
    type: hub.type,
    price: hub.price,
    specialties: hub.specialties,
    memberCount: hub.memberCount,
    isMember,
    createdAt: hub.createdAt,
  };
}

export async function createHub(userId: string, input: CreateHubInput) {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError("Kullanıcı bulunamadı", 404);
  }
  if (user.kycLevel < HUB_CREATION_KYC_LEVEL) {
    throw new HttpError("Hub kurmak için kimlik doğrulaması (Level 1) gerekli", 403);
  }
  if (input.type === "paid" && user.kycLevel < PAID_HUB_CREATION_KYC_LEVEL) {
    throw new HttpError("Ücretli Hub kurmak sadece eğitmenler için kullanılabilir (Level 4)", 403);
  }
  if (input.type === "paid" && !input.price) {
    throw new HttpError("Ücretli Hub için fiyat belirtilmeli", 400);
  }

  let iyzicoProductReferenceCode = "";
  let iyzicoPricingPlanReferenceCode = "";
  if (input.type === "paid") {
    const provisioned = await iyzicoService.createSubscriptionProductAndPlan({
      name: input.name,
      price: input.price!,
    });
    iyzicoProductReferenceCode = provisioned.productReferenceCode;
    iyzicoPricingPlanReferenceCode = provisioned.pricingPlanReferenceCode;
  }

  const created = await hubRepo.create({
    name: input.name,
    description: input.description ?? "",
    ownerId: new Types.ObjectId(userId),
    type: input.type,
    price: input.type === "paid" ? input.price! : "",
    specialties: input.specialties ?? [],
    iyzicoProductReferenceCode,
    iyzicoPricingPlanReferenceCode,
  });

  return serializeHub(created as HubDoc, userId, false);
}

export async function discoverHubs(userId: string, params: { cursor?: string; limit: number; specialty?: string }) {
  const cursorDate = params.cursor ? new Date(params.cursor) : undefined;
  const { hubs, hasMore } = await hubRepo.listPage({ cursor: cursorDate, limit: params.limit, specialty: params.specialty });

  const memberships = await hubMembershipRepo.listActiveByUser(userId);
  const activeHubIds = new Set(memberships.map((membership) => membership.hubId.toString()));

  const items = await Promise.all(
    hubs.map((hub) => serializeHub(hub as HubDoc, userId, activeHubIds.has(hub._id.toString()))),
  );

  const last = hubs[hubs.length - 1];
  return { hubs: items, nextCursor: hasMore && last ? last.createdAt.toISOString() : null };
}

export async function getHubDetail(hubId: string, userId: string) {
  const hub = await hubRepo.findById(hubId);
  if (!hub) {
    throw new HttpError("Hub bulunamadı", 404);
  }
  return serializeHub(hub as HubDoc, userId);
}

export async function listMyHubs(userId: string) {
  const memberships = await hubMembershipRepo.listActiveByUser(userId);
  const hubs = await hubRepo.findByIds(memberships.map((membership) => membership.hubId));
  return Promise.all(hubs.map((hub) => serializeHub(hub as HubDoc, userId, true)));
}

export async function listManagedHubs(userId: string) {
  const hubs = await hubRepo.listByOwner(new Types.ObjectId(userId));
  return Promise.all(hubs.map((hub) => serializeHub(hub as HubDoc, userId)));
}

export async function joinFreeHub(userId: string, hubId: string) {
  const hub = await hubRepo.findById(hubId);
  if (!hub) {
    throw new HttpError("Hub bulunamadı", 404);
  }
  if (hub.type !== "free") {
    throw new HttpError("Bu Hub ücretli, katılmak için ödeme akışını kullanın", 400);
  }

  const existing = await hubMembershipRepo.findLatestByHubAndUser(hubId, userId);
  if (existing?.status === "active") {
    throw new HttpError("Zaten bu Hub'a üyesiniz", 409);
  }

  await hubMembershipRepo.createActive({ hubId, userId });
  const updatedHub = await hubRepo.incrementMemberCount(hubId, 1);

  return serializeHub(updatedHub as HubDoc, userId, true);
}

export async function startHubMembershipCheckout(userId: string, hubId: string, billingInfo: BillingInfoInput) {
  const hub = await hubRepo.findById(hubId);
  if (!hub) {
    throw new HttpError("Hub bulunamadı", 404);
  }
  if (hub.type !== "paid") {
    throw new HttpError("Bu Hub ücretsiz, doğrudan katılabilirsiniz", 400);
  }

  const existing = await hubMembershipRepo.findLatestByHubAndUser(hubId, userId);
  if (existing?.status === "active") {
    throw new HttpError("Zaten bu Hub'a üyesiniz", 409);
  }

  const { user, merged } = await resolveBillingInfo(userId, billingInfo);

  const membership = await hubMembershipRepo.create({
    hubId,
    userId,
    checkoutConversationId: randomUUID(),
  });

  const displayName = user.showcase.displayName || user.email;
  const [name, ...rest] = displayName.trim().split(/\s+/);
  const surname = rest.length > 0 ? rest.join(" ") : "Kullanıcı";

  let checkout;
  try {
    checkout = await iyzicoService.initializeSubscriptionCheckout({
      conversationId: membership._id.toString(),
      pricingPlanReferenceCode: hub.iyzicoPricingPlanReferenceCode,
      callbackUrl: iyzicoConfig.hubMembershipCallbackUrl,
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
    await hubMembershipRepo.updateStatus(membership._id.toString(), {
      status: "canceled",
      cancelReason: "checkout_init_failed",
    });
    throw error;
  }

  await hubMembershipRepo.setCheckoutToken(membership._id.toString(), checkout.token);

  return {
    membershipId: membership._id.toString(),
    token: checkout.token,
    checkoutFormContent: checkout.checkoutFormContent,
  };
}

export async function handleHubMembershipCallback(token: string): Promise<void> {
  await processIdempotent({
    dedupeKey: `hub-callback:${token}`,
    source: "checkout_callback",
    eventType: "hub_membership.checkout.callback",
    process: async () => {
      const membership = await hubMembershipRepo.findByCheckoutToken(token);
      if (!membership) {
        throw new HttpError("Üyelik kaydı bulunamadı", 404);
      }

      const result = await iyzicoService.retrieveCheckoutFormResult(token);

      if (result.status === "success" && result.subscriptionStatus === "ACTIVE" && result.referenceCode) {
        const details = await iyzicoService.getSubscriptionDetails(result.referenceCode);
        await hubMembershipRepo.updateStatus(membership._id.toString(), {
          status: "active",
          iyzicoSubscriptionReferenceCode: result.referenceCode,
          iyzicoCustomerReferenceCode: result.customerReferenceCode ?? "",
          currentPeriodStart: details.startDate ? new Date(details.startDate) : new Date(),
          currentPeriodEnd: details.endDate ? new Date(details.endDate) : null,
        });
        await hubRepo.incrementMemberCount(membership.hubId.toString(), 1);
        await notifyHubMembershipActivated(membership.userId.toString());
      } else {
        await hubMembershipRepo.updateStatus(membership._id.toString(), {
          status: "canceled",
          cancelReason: "checkout_failed",
        });
      }
    },
  });
}

export async function handleHubMembershipWebhook(signatureHeader: string, payload: SubscriptionWebhookPayload): Promise<void> {
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
    dedupeKey: `hub-webhook:${payload.iyziReferenceCode}`,
    source: "subscription_webhook",
    eventType: payload.iyziEventType,
    iyzicoSubscriptionReferenceCode: payload.subscriptionReferenceCode,
    iyzicoOrderReferenceCode: payload.orderReferenceCode,
    process: async () => {
      const membership = await hubMembershipRepo.findByIyzicoSubscriptionReferenceCode(payload.subscriptionReferenceCode);
      if (!membership) {
        return;
      }

      const details = await iyzicoService.getSubscriptionDetails(payload.subscriptionReferenceCode);
      const previousStatus = membership.status;
      const nextStatus = mapIyzicoStatus(details.subscriptionStatus);

      await hubMembershipRepo.updateStatus(membership._id.toString(), {
        status: nextStatus,
        currentPeriodEnd: details.endDate ? new Date(details.endDate) : membership.currentPeriodEnd,
        lastPaymentFailureReason:
          payload.iyziEventType === "subscription.order.failure" ? "payment_failed" : membership.lastPaymentFailureReason,
      });

      if (nextStatus !== previousStatus) {
        if (nextStatus === "active" && payload.iyziEventType === "subscription.order.success") {
          await notifyHubMembershipRenewed(membership.userId.toString());
        } else if (nextStatus === "past_due" || payload.iyziEventType === "subscription.order.failure") {
          await notifyHubMembershipPaymentFailed(membership.userId.toString());
        }
      }
    },
  });
}

export async function leaveHub(userId: string, hubId: string) {
  const hub = await hubRepo.findById(hubId);
  if (!hub) {
    throw new HttpError("Hub bulunamadı", 404);
  }
  const membership = await hubMembershipRepo.findLatestByHubAndUser(hubId, userId);
  if (!membership || membership.status !== "active") {
    throw new HttpError("Bu Hub'a üye değilsiniz", 404);
  }

  if (hub.type === "paid" && membership.iyzicoSubscriptionReferenceCode) {
    await iyzicoService.cancelIyzicoSubscription(membership.iyzicoSubscriptionReferenceCode);
  }

  await hubMembershipRepo.updateStatus(membership._id.toString(), {
    status: "canceled",
    canceledAt: new Date(),
    cancelReason: "user_requested",
  });
  await hubRepo.incrementMemberCount(hubId, -1);
  await notifyHubMembershipCanceled(userId);

  return { status: "canceled" as const };
}

async function requireActiveMembership(userId: string, hubId: string): Promise<HubMembershipDoc> {
  const membership = await hubMembershipRepo.findLatestByHubAndUser(hubId, userId);
  if (!membership || membership.status !== "active") {
    throw new HttpError("Bu içeriğe erişmek için Hub'a üye olmalısınız", 403);
  }
  return membership as HubMembershipDoc;
}

export async function requestHubPostImageUploadUrl(userId: string, contentType: string) {
  const storageKey = buildStorageKey(userId, "hub-post", contentType);
  const uploadUrl = await createUploadUrl(storageKey, contentType);
  return { uploadUrl, storageKey };
}

export async function createHubPost(userId: string, hubId: string, input: { text: string; images?: string[] }) {
  await requireActiveMembership(userId, hubId);

  const created = await hubPostRepo.create({
    hubId,
    userId,
    text: input.text,
    images: (input.images ?? []).map((storageKey) => ({ storageKey })),
  });

  const user = await findUserById(userId);
  const author = await resolveUserSummary(user as unknown as UserSummarySource);
  const images = await Promise.all(created.images.map((image) => createDownloadUrl(image.storageKey)));

  return {
    id: created._id.toString(),
    hubId: created.hubId.toString(),
    text: created.text,
    images,
    author,
    createdAt: created.createdAt,
  };
}

export async function listHubFeed(userId: string, hubId: string, params: { cursor?: string; limit: number }) {
  await requireActiveMembership(userId, hubId);

  const cursorDate = params.cursor ? new Date(params.cursor) : undefined;
  const { posts, hasMore } = await hubPostRepo.listPage({ hubId, cursor: cursorDate, limit: params.limit });

  const items = await Promise.all(
    posts.map(async (post) => {
      const populatedUser = post.userId as unknown as UserSummarySource;
      const author = await resolveUserSummary(populatedUser);
      const images = await Promise.all(post.images.map((image) => createDownloadUrl(image.storageKey)));
      return {
        id: post._id.toString(),
        hubId: post.hubId.toString(),
        text: post.text,
        images,
        author,
        createdAt: post.createdAt,
      };
    }),
  );

  const last = posts[posts.length - 1];
  return { posts: items, nextCursor: hasMore && last ? last.createdAt.toISOString() : null };
}
