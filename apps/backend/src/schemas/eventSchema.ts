import { EventStatusEnum, EventTypeEnum, EventSuitabilityEnum } from '@prisma/client';
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

export type EventSchemaType = z.infer<typeof EventSchema>;