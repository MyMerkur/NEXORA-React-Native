import { randomUUID } from "crypto";
import { Types } from "mongoose";
import { env } from "../config/env";
import { iyzicoConfig } from "../config/iyzico";
import { findUserById } from "../repositories/user.repository";
import * as eventRepo from "../repositories/event.repository";
import * as eventTicketRepo from "../repositories/eventTicketPurchase.repository";
import * as iyzicoService from "./iyzico.service";
import { resolveBillingInfo } from "./subscription.service";
import { getQrCodeDataUrl, buildVerificationUrl } from "./certificate.service";
import { notifyEventTicketPurchased } from "./notification.service";
import { resolveUserSummary, type UserSummarySource } from "../utils/userSummary";
import { HttpError } from "../utils/httpError";
import { logger } from "../utils/logger";

interface BillingInfoInput {
  identityNumber?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
}

function isAdminEmail(email: string): boolean {
  return env.ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function startTicketCheckout(
  userId: string,
  eventId: string,
  ticketTypeId: string,
  billingInfo: BillingInfoInput,
) {
  const event = await eventRepo.findById(eventId);
  if (!event) {
    throw new HttpError("Etkinlik bulunamadı", 404);
  }
  const ticketType = event.ticketTypes.find((ticket) => ticket._id.toString() === ticketTypeId);
  if (!ticketType) {
    throw new HttpError("Bilet tipi bulunamadı", 404);
  }
  if (ticketType.soldCount >= ticketType.capacity) {
    throw new HttpError("Bu bilet tipi için kontenjan doldu", 409);
  }

  const { user, merged } = await resolveBillingInfo(userId, billingInfo);

  const purchase = await eventTicketRepo.create({
    eventId,
    ticketTypeId,
    userId,
    checkoutConversationId: randomUUID(),
    price: ticketType.price,
  });

  const displayName = user.showcase.displayName || user.email;
  const [name, ...rest] = displayName.trim().split(/\s+/);
  const surname = rest.length > 0 ? rest.join(" ") : "Kullanıcı";

  let checkout;
  try {
    checkout = await iyzicoService.initializeEventTicketCheckout({
      conversationId: purchase._id.toString(),
      price: ticketType.price,
      callbackUrl: iyzicoConfig.eventTicketCallbackUrl,
      ticketLabel: `${event.title} — ${ticketType.name}`,
      buyer: {
        id: userId,
        name: name || "Kullanıcı",
        surname,
        email: user.email,
        gsmNumber: merged.phone,
        identityNumber: merged.identityNumber,
        registrationAddress: merged.address,
        city: merged.city,
        country: merged.country,
      },
    });
  } catch (error) {
    await eventTicketRepo.markFailedIfPending(purchase._id.toString());
    throw error;
  }

  await eventTicketRepo.setCheckoutToken(purchase._id.toString(), checkout.token);

  return {
    purchaseId: purchase._id.toString(),
    token: checkout.token,
    checkoutFormContent: checkout.checkoutFormContent,
  };
}

export async function handleTicketCallback(token: string): Promise<void> {
  const purchase = await eventTicketRepo.findByCheckoutToken(token);
  if (!purchase) {
    throw new HttpError("Satın alma kaydı bulunamadı", 404);
  }
  if (purchase.status !== "pending_checkout") {
    return;
  }

  const result = await iyzicoService.retrieveJobCreditCheckoutResult(token);

  if (result.paymentStatus !== "SUCCESS") {
    await eventTicketRepo.markFailedIfPending(purchase._id.toString());
    return;
  }

  const event = await eventRepo.findById(purchase.eventId.toString());
  const ticketType = event?.ticketTypes.find((type) => type._id.toString() === purchase.ticketTypeId.toString());
  if (!event || !ticketType) {
    await eventTicketRepo.markFailedIfPending(purchase._id.toString());
    return;
  }

  // Capacity is reserved atomically BEFORE the ticket is marked paid — the checkout-start
  // capacity check is only a soft gate, so payment can still succeed after the last spot is
  // taken by a concurrent buyer. In that case we must not issue a ticket for money already paid.
  const capacityReserved = await eventRepo.incrementSoldCountIfCapacity(
    purchase.eventId.toString(),
    purchase.ticketTypeId.toString(),
    ticketType.capacity,
  );

  if (!capacityReserved) {
    await eventTicketRepo.markOversoldIfPending(purchase._id.toString(), result.paymentId ?? "");
    logger.error("event.ticket.oversold_after_payment", {
      purchaseId: purchase._id.toString(),
      eventId: purchase.eventId.toString(),
      ticketTypeId: purchase.ticketTypeId.toString(),
      userId: purchase.userId.toString(),
      iyzicoPaymentId: result.paymentId,
    });
    return;
  }

  const updated = await eventTicketRepo.markPaidIfPending(purchase._id.toString(), result.paymentId ?? "", randomUUID());
  if (updated) {
    await notifyEventTicketPurchased(purchase.userId.toString(), event.title);
  }
}

export async function listMyTickets(userId: string) {
  const tickets = await eventTicketRepo.listByUser(userId);
  return Promise.all(
    tickets.map(async (ticket) => {
      const event = ticket.eventId as unknown as {
        _id: Types.ObjectId;
        title: string;
        startsAt: Date;
        location: string;
        ticketTypes: { _id: Types.ObjectId; name: string }[];
      };
      const ticketType = event.ticketTypes.find((type) => type._id.toString() === ticket.ticketTypeId.toString());

      return {
        id: ticket._id.toString(),
        event: { id: event._id.toString(), title: event.title, startsAt: event.startsAt, location: event.location },
        ticketTypeName: ticketType?.name ?? "",
        price: ticket.price,
        checkedInAt: ticket.checkedInAt,
        verificationCode: ticket.verificationCode!,
        qrCodeDataUrl: await getQrCodeDataUrl(ticket.verificationCode!),
        verificationUrl: buildVerificationUrl(ticket.verificationCode!),
        createdAt: ticket.createdAt,
      };
    }),
  );
}

export async function checkInTicket(userId: string, verificationCode: string) {
  const requester = await findUserById(userId);
  if (!requester) {
    throw new HttpError("Kullanıcı bulunamadı", 404);
  }

  const ticket = await eventTicketRepo.findByVerificationCode(verificationCode);
  if (!ticket || ticket.status !== "paid") {
    throw new HttpError("Bilet bulunamadı veya geçersiz", 404);
  }

  const event = ticket.eventId as unknown as { _id: Types.ObjectId; title: string; organizerId: Types.ObjectId };
  const isOrganizer = event.organizerId.toString() === userId;
  const isAdmin = isAdminEmail(requester.email);
  if (!isOrganizer && !isAdmin) {
    throw new HttpError("Bu etkinliğin check-in işlemini sadece organizatör yapabilir", 403);
  }

  const holder = ticket.userId as unknown as UserSummarySource;
  const attendee = await resolveUserSummary(holder);

  if (ticket.checkedInAt) {
    return { valid: true, alreadyCheckedIn: true, attendeeName: attendee.displayName, eventTitle: event.title };
  }

  await eventTicketRepo.markCheckedIn(ticket._id.toString());

  return { valid: true, alreadyCheckedIn: false, attendeeName: attendee.displayName, eventTitle: event.title };
}

export async function listEventAttendees(userId: string, eventId: string) {
  const requester = await findUserById(userId);
  if (!requester) {
    throw new HttpError("Kullanıcı bulunamadı", 404);
  }
  const event = await eventRepo.findById(eventId);
  if (!event) {
    throw new HttpError("Etkinlik bulunamadı", 404);
  }
  const isOrganizer = event.organizerId.toString() === userId;
  if (!isOrganizer && !isAdminEmail(requester.email)) {
    throw new HttpError("Bu etkinliğin katılımcılarını görme yetkiniz yok", 403);
  }

  const tickets = await eventTicketRepo.listByEvent(eventId);
  return Promise.all(
    tickets.map(async (ticket) => ({
      id: ticket._id.toString(),
      attendee: await resolveUserSummary(ticket.userId as unknown as UserSummarySource),
      checkedInAt: ticket.checkedInAt,
      createdAt: ticket.createdAt,
    })),
  );
}
