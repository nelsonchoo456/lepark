// enum OccurrenceStatusEnum {
//   HEALTHY = 'HEALTHY',
//   MONITOR_AFTER_TREATMENT = 'MONITOR_AFTER_TREATMENT',
//   NEEDS_ATTENTION = 'NEEDS_ATTENTION',
//   URGENT_ACTION_REQUIRED = 'URGENT_ACTION_REQUIRED',
//   REMOVED = 'REMOVED',
// }

import { ParkResponse } from './park';
import { DecarbonizationTypeEnum, OccurrenceStatusEnum } from './sharedEnums';
import { SpeciesResponse } from './species';
import { ZoneResponse } from './zone';

export interface OccurrenceData {
  lat: number;
  lng: number;
  title: string;
  dateObserved: string;
  dateOfBirth: string;
  numberOfPlants: number;
  biomass: number;
  description: string;
  occurrenceStatus: OccurrenceStatusEnum;
  decarbonizationType: DecarbonizationTypeEnum;
  speciesId: string;
  images: string[];
}

export interface OccurrenceResponse {
  id: string;
  lat: number;
  lng: number;
  title: string;
  dateObserved: string;
  dateOfBirth: string;
  numberOfPlants: number;
  biomass: number;
  description: string;
  speciesId: string;
  speciesName: string;
  zoneId: number;
  zoneName?: string;
  parkId?: number;
  parkName?: string;
  images: string[];
  occurrenceStatus?: OccurrenceStatusEnum;
  decarbonizationType: DecarbonizationTypeEnum;
  park: ParkResponse;
  zone: ZoneResponse;
  species: SpeciesResponse;
}

export interface OccurrenceUpdateData {
  lat?: number;
  lng?: number;
  title?: string;
  dateObserved?: string;
  dateOfBirth?: string;
  numberOfPlants?: number;
  biomass?: number;
  description?: string;
  occurrenceStatus?: OccurrenceStatusEnum;
  decarbonizationType?: DecarbonizationTypeEnum;
  speciesId?: string;
  images?: string[];
}
