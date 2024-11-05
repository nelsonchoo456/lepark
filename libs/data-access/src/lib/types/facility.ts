import { FacilityTypeEnum, FacilityStatusEnum } from './sharedenums';
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
}

// export enum FacilityType {
//   TOILET = "TOILET",
//   PLAYGROUND  = "PLAYGROUND",
//   INFORMATION = "INFORMATION",
//   CARPARK = "CARPARK",
//   ACCESSIBILITY = "ACCESSIBILITY",
//   STAGE = "STAGE",
//   WATER_FOUNTAIN = "WATER_FOUNTAIN",
//   PICNIC_AREA = "PICNIC_AREA",
//   BBQ_PIT = "BBQ_PIT",
//   CAMPING_AREA = "CAMPING_AREA",
//   AED = "AED",
//   FIRST_AID = "FIRST_AID",
//   AMPHITHEATER = "AMPHITHEATER",
//   GAZEBO = "GAZEBO",
//   STOREROOM = "STOREROOM",
//   OTHERS = "OTHERS"
// }

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
}
