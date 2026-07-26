import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { createEventSchema, ticketCheckoutSchema, checkInSchema } from "../validators/event.validator";
import * as eventService from "../services/event.service";
import * as eventTicketService from "../services/eventTicket.service";

export async function createEventHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = createEventSchema.parse(req.body);
    const result = await eventService.createEvent(req.user!.id, input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listUpcomingEventsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await eventService.listUpcomingEvents();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listMyOrganizedEventsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await eventService.listMyOrganizedEvents(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listEventAttendeesHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await eventTicketService.listEventAttendees(req.user!.id, req.params.eventId!);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function startTicketCheckoutHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { ticketTypeId, ...billingInfo } = ticketCheckoutSchema.parse(req.body);
    const result = await eventTicketService.startTicketCheckout(
      req.user!.id,
      req.params.eventId!,
      ticketTypeId,
      billingInfo,
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listMyTicketsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await eventTicketService.listMyTickets(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function checkInTicketHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { verificationCode } = checkInSchema.parse(req.body);
    const result = await eventTicketService.checkInTicket(req.user!.id, verificationCode);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
