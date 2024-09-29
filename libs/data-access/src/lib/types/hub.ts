import { HubStatusEnum } from './sharedenums';

export interface HubData {
  serialNumber: string;
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
  facilityId: string;
}

export interface HubResponse {
  id: string;
  serialNumber: string;
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
  parkName?: string;
  facilityName?: string;
  zoneName?: string;
}
