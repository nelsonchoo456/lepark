import { FacilityResponse } from './facility';
import { ParkResponse } from './park';
import { ZoneResponse } from './zone';
import { HubStatusEnum } from './sharedEnums';
import { SensorResponse } from './sensor';

export interface HubData {
  name: string;
  serialNumber: string;
  description?: string;
  hubStatus: HubStatusEnum;
  acquisitionDate: string;
  nextMaintenanceDate?: string;
  nextMaintenanceDates?: string[];
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
  lastDataUpdateDate?: string;
}

export interface HubResponse {
  id: string;
  serialNumber: string;
  identifierNumber: string;
  name: string;
  description?: string;
  hubStatus: HubStatusEnum;
  acquisitionDate: string;
  nextMaintenanceDate?: string;
  nextMaintenanceDates?: string[];
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
  remarks?: string | null;
  zoneId?: number;
  facilityId?: string;
  park: ParkResponse;
  facility: FacilityResponse;
  zone?: ZoneResponse;
  lastDataUpdateDate?: string;
  sensors?: SensorResponse[];
}

export interface HubUpdateData {
  name?: string;
  serialNumber?: string;
  description?: string;
  hubStatus?: HubStatusEnum;
  acquisitionDate?: string;
  nextMaintenanceDate?: string;
  nextMaintenanceDates?: string[];
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
  lastDataUpdateDate?: string;
}
