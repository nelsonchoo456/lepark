import { z } from 'zod';

export const HistoricalRainSchema = z.object({
  id: z.string().uuid().optional(),
  stationId: z.string(),
  stationName: z.string(),
  lat: z.number(),
  lng: z.number(),
  value: z.number(),
  timestamp: z.date(),
});

export type HistoricalRainSchemaType = z.infer<typeof HistoricalRainSchema>;