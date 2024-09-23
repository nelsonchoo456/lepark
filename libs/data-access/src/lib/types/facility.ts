import { FacilityTypeEnum, FacilityStatusEnum } from '@prisma/client';

export interface FacilityData {
  facilityName: string;
  facilityDescription: string;
  isBookable: boolean;
  isPublic: boolean;
  isSheltered: boolean;
  facilityType: FacilityTypeEnum;
  reservationPolicy: string;
  rulesAndRegulations: string;
  images?: string[];
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  openingHours: string[];
  closingHours: string[];
  facilityStatus: FacilityStatusEnum;
  lat?: number;
  long?: number;
  size: number;
  capacity: number;
  fee: number;
  parkId: number;
}

export interface FacilityResponse {
  id: string;
  facilityName: string;
  facilityDescription: string;
  isBookable: boolean;
  isPublic: boolean;
  isSheltered: boolean;
  facilityType: FacilityTypeEnum;
  reservationPolicy: string;
  rulesAndRegulations: string;
  images?: string[];
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
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
}
