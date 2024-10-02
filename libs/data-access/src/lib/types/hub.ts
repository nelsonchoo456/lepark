import { FacilityResponse } from './facility';
import { ParkResponse } from './park';
import { ZoneResponse } from './zone';
import { HubStatusEnum } from './sharedenums';

export interface HubData {
  name: string;
  serialNumber: string;
  description?: string;
  hubStatus: HubStatusEnum;
  acquisitionDate: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  dataTransmissionInterval?: number;
  supplier: string;
  supplierContactNumber: string;
  ipAddress?: string;
  macAddress?: string;
  radioGroup?: number;
  hubSecret?: string;
  images?: string[];
  lat?: number;
  long?: number;
  remarks?: string;
  zoneId?: number;
  facilityId?: string;
}

export interface HubResponse {
  id: string;
  serialNumber: string;
  identifierNumber: string;
  name: string;
  description?: string;
  hubStatus: HubStatusEnum;
  acquisitionDate: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  dataTransmissionInterval?: number;
  supplier: string;
  supplierContactNumber: string;
  ipAddress?: string;
  macAddress?: string;
  radioGroup?: number;
  hubSecret?: string;
  images?: string[];
  lat?: number;
  long?: number;
  remarks?: string;
  zoneId?: number;
  facilityId?: string;
  park: ParkResponse;
  facility: FacilityResponse;
  zone?: ZoneResponse;
}

export interface HubUpdateData {
  name?: string;
  serialNumber?: string;
  description?: string;
  hubStatus?: HubStatusEnum;
  acquisitionDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  dataTransmissionInterval?: number;
  supplier?: string;
  supplierContactNumber?: string;
  ipAddress?: string;
  macAddress?: string;
  radioGroup?: number;
  hubSecret?: string;
  images?: string[];
  lat?: number;
  long?: number;
  remarks?: string;
  zoneId?: number;
  facilityId?: string;
}