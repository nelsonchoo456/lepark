import { z } from 'zod';

export const BookingSchema = z.object({
  bookingPurpose: z.string(),
  pax: z.number().positive(),
  bookingStatus: z.enum(['PENDING', 'CANCELLED', 'REJECTED', 'APPROVED_PENDING_PAYMENT', 'UNPAID_CLOSED', 'CONFIRMED', 'CONFIRMED_CLOSED']),
  dateStart: z.date(),
  dateEnd: z.date(),
  dateBooked: z.date(),
  paymentDeadline: z.date().optional(),
  visitorRemarks: z.string().optional(),
  facilityId: z.string().uuid(),
  visitorId: z.string().uuid(),
});

export type BookingSchemaType = z.infer<typeof BookingSchema>;
