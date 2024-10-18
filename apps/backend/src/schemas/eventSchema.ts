import { EventStatusEnum, EventTypeEnum, EventSuitabilityEnum, EventTicketNationalityEnum, EventTicketCategoryEnum } from '@prisma/client';
import { z } from 'zod';

export const EventSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.nativeEnum(EventTypeEnum),
  suitability: z.nativeEnum(EventSuitabilityEnum),
  startDate: z.date(),
  endDate: z.date(),
  startTime: z.date(),
  endTime: z.date(),
  maxCapacity: z.number().int().positive(),
  ticketingPolicy: z.string(),
  images: z.array(z.string()).optional(),
  status: z.nativeEnum(EventStatusEnum),
  facilityId: z.string().uuid()
});

export const EventTicketListingSchema = z.object({
  category: z.nativeEnum(EventTicketCategoryEnum),
  nationality: z.nativeEnum(EventTicketNationalityEnum),
  description: z.string(),
  price: z.number(),
  isActive: z.boolean(),
  eventId: z.string()
});

export type EventSchemaType = z.infer<typeof EventSchema>;
export type EventTicketListingSchemaType = z.infer<typeof EventTicketListingSchema>;