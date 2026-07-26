import { apiClient } from "./authApi";
import type { BillingInfoInput } from "./subscriptionApi";

export interface EventOrganizer {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface EventTicketType {
  id: string;
  name: string;
  price: string;
  capacity: number;
  soldCount: number;
  soldOut: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  organizer: EventOrganizer;
  ticketTypes: EventTicketType[];
  createdAt: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  ticketTypes: { name: string; price: string; capacity: number }[];
}

export interface EventTicketCheckoutSession {
  purchaseId: string;
  token: string;
  checkoutFormContent: string;
}

export interface MyEventTicket {
  id: string;
  event: { id: string; title: string; startsAt: string; location: string };
  ticketTypeName: string;
  price: string;
  checkedInAt: string | null;
  verificationCode: string;
  qrCodeDataUrl: string;
  verificationUrl: string;
  createdAt: string;
}

export interface EventAttendee {
  id: string;
  attendee: EventOrganizer;
  checkedInAt: string | null;
  createdAt: string;
}

export interface CheckInResult {
  valid: boolean;
  alreadyCheckedIn: boolean;
  attendeeName: string;
  eventTitle: string;
}

export async function createEvent(input: CreateEventInput): Promise<EventItem> {
  const { data } = await apiClient.post<EventItem>("/api/v1/events", input);
  return data;
}

export async function listUpcomingEvents(): Promise<EventItem[]> {
  const { data } = await apiClient.get<EventItem[]>("/api/v1/events");
  return data;
}

export async function listMyOrganizedEvents(): Promise<EventItem[]> {
  const { data } = await apiClient.get<EventItem[]>("/api/v1/events/mine");
  return data;
}

export async function startTicketCheckout(
  eventId: string,
  ticketTypeId: string,
  billingInfo: BillingInfoInput = {},
): Promise<EventTicketCheckoutSession> {
  const { data } = await apiClient.post<EventTicketCheckoutSession>(`/api/v1/events/${eventId}/tickets/checkout`, {
    ticketTypeId,
    ...billingInfo,
  });
  return data;
}

export async function listMyTickets(): Promise<MyEventTicket[]> {
  const { data } = await apiClient.get<MyEventTicket[]>("/api/v1/events/tickets/mine");
  return data;
}

export async function listEventAttendees(eventId: string): Promise<EventAttendee[]> {
  const { data } = await apiClient.get<EventAttendee[]>(`/api/v1/events/${eventId}/attendees`);
  return data;
}

export async function checkInTicket(verificationCode: string): Promise<CheckInResult> {
  const { data } = await apiClient.post<CheckInResult>("/api/v1/events/tickets/check-in", { verificationCode });
  return data;
}
