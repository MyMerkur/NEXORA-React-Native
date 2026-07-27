import { Schema, model, type InferSchemaType } from "mongoose";

const ticketTypeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    price: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    soldCount: { type: Number, default: 0 },
  },
  { _id: true },
);

const eventSchema = new Schema(
  {
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 3000, default: "" },
    location: { type: String, trim: true, maxlength: 200, default: "" },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    ticketTypes: { type: [ticketTypeSchema], default: [] },
  },
  { timestamps: true },
);

eventSchema.index({ startsAt: 1 });
eventSchema.index({ organizerId: 1, createdAt: -1 });

export type Event = InferSchemaType<typeof eventSchema>;
export type EventTicketType = InferSchemaType<typeof ticketTypeSchema>;

export const EventModel = model("Event", eventSchema);
