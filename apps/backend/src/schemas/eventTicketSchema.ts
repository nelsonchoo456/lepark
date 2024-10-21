import { z } from 'zod';

export const EventTicketSchema = z.object({
  eventDate: z.date(),
  status: z.enum(['VALID', 'INVALID', 'USED']),
  price: z.number().positive(),
  eventTicketListingId: z.string().uuid(),
  eventTicketTransactionId: z.string().uuid(),
});

// Base schema for EventTicketTransaction
export const EventTicketTransactionSchema = z.object({
  eventDate: z.date(),
  purchaseDate: z.date(),
  totalAmount: z.number().positive(),
  eventId: z.string().uuid(),
  visitorId: z.string().uuid(),
});

export type EventTicketSchemaType = z.infer<typeof EventTicketSchema>;
export type EventTicketTransactionSchemaType = z.infer<typeof EventTicketTransactionSchema>;
