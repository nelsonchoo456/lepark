import { FacilityTypeEnum, FacilityStatusEnum } from './sharedEnums';
import { EventResponse } from './event';

export interface FacilityData {
  name: string;
  description: string;
  isBookable: boolean;
  isPublic: boolean;
  isSheltered: boolean;
  facilityType: FacilityTypeEnum;
  reservationPolicy: string;
  rulesAndRegulations: string;
  images?: string[];
  openingHours: string[];
  closingHours: string[];
  facilityStatus: FacilityStatusEnum;
  lat?: number;
  long?: number;
  size: number;
  capacity: number;
  fee: number;
  parkId: number;

  cameraSensorId?: string;
}

export interface FacilityResponse {
  id: string;
  name: string;
  description: string;
  isBookable: boolean;
  isPublic: boolean;
  isSheltered: boolean;
  facilityType: FacilityTypeEnum;
  reservationPolicy: string;
  rulesAndRegulations: string;
  images?: string[];
  openingHours: string[];
  closingHours: string[];
  facilityStatus: FacilityStatusEnum;
  lat?: number;
  long?: number;
  size: number;
  capacity: number;
  fee: number;
  parkId: number;
  hubs?: string[]; // Array of hub IDs associated with this facility
  events?: string[]; // Array of event IDs associated with this facility

  cameraSensorId?: string;
}

export interface FacilityWithEvents {
  id: string;
  name: string;
  description: string;
  isBookable: boolean;
  isPublic: boolean;
  isSheltered: boolean;
  facilityType: FacilityTypeEnum;
  reservationPolicy: string;
  rulesAndRegulations: string;
  images?: string[];
  openingHours: string[];
  closingHours: string[];
  facilityStatus: FacilityStatusEnum;
  lat?: number;
  long?: number;
  size: number;
  capacity: number;
  fee: number;
  parkId: number;
  hubs?: string[]; // Array of hub IDs associated with this facility
  events: EventResponse[]; // Array of event IDs associated with this facility

  cameraSensorId?: string;
}
