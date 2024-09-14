import { z } from 'zod';
import { ConservationStatusEnum, LightTypeEnum, SoilTypeEnum } from '@prisma/client';

export const SpeciesSchema = z.object({
  phylum: z.string().min(1, { message: "Phylum is required" }),
  class: z.string().min(1, { message: "Class is required" }),
  order: z.string().min(1, { message: "Order is required" }),
  family: z.string().min(1, { message: "Family is required" }),
  genus: z.string().min(1, { message: "Genus is required" }),
  speciesName: z.string().min(1, { message: "Species name is required" }),
  commonName: z.string().min(1, { message: "Common name is required" }),
  speciesDescription: z.string().min(1, { message: "Species description is required" }),
  conservationStatus: z.nativeEnum(ConservationStatusEnum),
  originCountry: z.string().min(1, { message: "Origin country is required" }),
  lightType: z.nativeEnum(LightTypeEnum),
  soilType: z.nativeEnum(SoilTypeEnum),
  fertiliserType: z.string().min(1, { message: "Fertiliser type is required" }),
  images: z.array(z.string()),
  waterRequirement: z.number().int().min(1).max(100, { message: "Water requirement must be between 0 and 100" }),
  fertiliserRequirement: z.number().int().min(1).max(100, { message: "Fertiliser requirement must be between 0 and 100" }),
  idealHumidity: z.number().min(1).max(100, { message: "Ideal humidity must be between 0 and 100" }),
  minTemp: z.number().min(0, { message: "Minimum temperature cannot be below absolute zero" }),
  maxTemp: z.number().max(100, { message: "Maximum temperature cannot exceed 100°C" }),
  idealTemp: z.number(),
  isDroughtTolerant: z.boolean(),
  isFastGrowing: z.boolean(),
  isSlowGrowing: z.boolean(),
  isEdible: z.boolean(),
  isDeciduous: z.boolean(),
  isEvergreen: z.boolean(),
  isToxic: z.boolean(),
  isFragrant: z.boolean(),
});

export type SpeciesSchemaType = z.infer<typeof SpeciesSchema>;
