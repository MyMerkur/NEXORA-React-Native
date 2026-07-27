import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createEventHandler,
  listUpcomingEventsHandler,
  listMyOrganizedEventsHandler,
  listEventAttendeesHandler,
  startTicketCheckoutHandler,
  listMyTicketsHandler,
  checkInTicketHandler,
} from "../controllers/event.controller";

export const eventRouter = Router();

eventRouter.use(requireAuth);
eventRouter.post("/events", createEventHandler);
eventRouter.get("/events", listUpcomingEventsHandler);
eventRouter.get("/events/mine", listMyOrganizedEventsHandler);
eventRouter.get("/events/tickets/mine", listMyTicketsHandler);
eventRouter.post("/events/tickets/check-in", checkInTicketHandler);
eventRouter.get("/events/:eventId/attendees", listEventAttendeesHandler);
eventRouter.post("/events/:eventId/tickets/checkout", startTicketCheckoutHandler);
