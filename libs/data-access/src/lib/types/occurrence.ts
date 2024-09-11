import { OccurrenceStatusEnum } from './sharedenums';

export enum DecarbonizationTypeEnum {
  TREE_TROPICAL = 'TREE_TROPICAL',
  TREE_MANGROVE = 'TREE_MANGROVE',
  SHRUB = 'SHRUB',
}

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
  images: string[];
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
}