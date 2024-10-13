import { z } from 'zod';

export const AttractionTicketSchema = z.object({
  attractionDate: z.date(),
  status: z.enum(['VALID', 'INVALID', 'USED']),
  price: z.number().positive(),
  attractionTicketListingId: z.string().uuid(),
  attractionTicketTransactionId: z.string().uuid(),
});

// Base schema for AttractionTicketTransaction
export const AttractionTicketTransactionSchema = z.object({
  attractionDate: z.date(),
  purchaseDate: z.date(),
  totalAmount: z.number().positive(),
  attractionId: z.string().uuid(),
  visitorId: z.string().uuid(),
});

export type AttractionTicketSchemaType = z.infer<typeof AttractionTicketSchema>;
export type AttractionTicketTransactionSchemaType = z.infer<typeof AttractionTicketTransactionSchema>;
