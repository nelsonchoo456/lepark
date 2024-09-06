import { z } from 'zod';
import { DECARBONIZATION_TYPE } from '@prisma/client';

export const OccurrenceSchema = z.object({
  id: z.string().uuid().optional(),  // ID is optional because it's usually auto-generated
  lat: z.number().min(-90).max(90).optional(),  
  lng: z.number().min(-180).max(180).optional(), 
  title: z.string().optional(), 
  dateObserved: z.date(),
  // dateObserved: z.preprocess((arg) => new Date(arg as string), z.date()),
  dateOfBirth: z.date().optional(),
  // dateOfBirth: z.preprocess((arg) => arg ? new Date(arg as string) : undefined, z.date().optional()),
  // dateOfBirth: z.preprocess((arg) => new Date(arg as string), z.date()),
  numberOfPlants: z.number().positive(), 
  biomass: z.number().positive(),      
  description: z.string().optional(),        
  decarbonizationType: z.nativeEnum(DECARBONIZATION_TYPE), 
  speciesId: z.string().uuid(),        
  // decarbonizationAreaId: z.string().uuid(),
});

export type OccurrenceSchemaType = z.infer<typeof OccurrenceSchema>;
