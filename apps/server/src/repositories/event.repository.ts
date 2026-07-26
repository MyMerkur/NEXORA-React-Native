import { Types } from "mongoose";
import { EventModel } from "../models/Event";

interface CreateEventInput {
  organizerId: string;
  title: string;
  description: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
  ticketTypes: { name: string; price: string; capacity: number }[];
}

export async function create(data: CreateEventInput) {
  return EventModel.create({
    organizerId: new Types.ObjectId(data.organizerId),
    title: data.title,
    description: data.description,
    location: data.location,
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    ticketTypes: data.ticketTypes,
  });
}

export async function findById(eventId: string) {
  return EventModel.findById(eventId);
}

export async function findByIdWithOrganizer(eventId: string) {
  return EventModel.findById(eventId).populate("organizerId", "email showcase.displayName showcase.avatarKey");
}

export async function listUpcoming() {
  return EventModel.find({ startsAt: { $gte: new Date() } })
    .sort({ startsAt: 1 })
    .populate("organizerId", "email showcase.displayName showcase.avatarKey");
}

export async function listByOrganizer(organizerId: string) {
  return EventModel.find({ organizerId: new Types.ObjectId(organizerId) }).sort({ createdAt: -1 });
}

export async function incrementSoldCountIfCapacity(eventId: string, ticketTypeId: string, capacity: number) {
  return EventModel.findOneAndUpdate(
    {
      _id: eventId,
      ticketTypes: { $elemMatch: { _id: new Types.ObjectId(ticketTypeId), soldCount: { $lt: capacity } } },
    },
    { $inc: { "ticketTypes.$[ticket].soldCount": 1 } },
    { new: true, arrayFilters: [{ "ticket._id": new Types.ObjectId(ticketTypeId) }] },
  );
}
