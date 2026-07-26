import { Schema, model, type InferSchemaType } from "mongoose";

export const EVENT_TICKET_STATUSES = ["pending_checkout", "paid", "failed"] as const;
export type EventTicketStatus = (typeof EVENT_TICKET_STATUSES)[number];

const eventTicketPurchaseSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    ticketTypeId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: EVENT_TICKET_STATUSES, default: "pending_checkout" },
    checkoutToken: { type: String, default: "" },
    checkoutConversationId: { type: String, default: "" },
    price: { type: String, default: "" },
    iyzicoPaymentId: { type: String, default: "" },
    verificationCode: { type: String },
    checkedInAt: { type: Date, default: null },
  },
  { timestamps: true },
);

eventTicketPurchaseSchema.index({ eventId: 1, userId: 1, createdAt: -1 });
eventTicketPurchaseSchema.index({ checkoutToken: 1 }, { sparse: true });
eventTicketPurchaseSchema.index({ verificationCode: 1 }, { unique: true, sparse: true });

export type EventTicketPurchase = InferSchemaType<typeof eventTicketPurchaseSchema>;

export const EventTicketPurchaseModel = model("EventTicketPurchase", eventTicketPurchaseSchema);
