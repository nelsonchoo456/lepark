import { HubStatusEnum } from '@prisma/client';

export interface HubData {
  serialNumber: string;
  name: string;
  description?: string;
  hubStatus: HubStatusEnum;
  acquisitionDate: string;
  lastCalibratedDate: string;
  calibrationFrequencyDays: number;
  recurringMaintenanceDuration: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  dataTransmissionInterval: number;
  ipAddress: string;
  macAddress: string;
  radioGroup: number;
  hubSecret: string;
  images?: string[];
  lat?: number;
  long?: number;
  remarks?: string;
  zoneId?: number;
  facilityId?: number;
}

export interface HubResponse {
  id: string;
  serialNumber: string;
  name: string;
  description?: string;
  hubStatus: HubStatusEnum;
  acquisitionDate: string;
  lastCalibratedDate: string;
  calibrationFrequencyDays: number;
  recurringMaintenanceDuration: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  dataTransmissionInterval: number;
  ipAddress: string;
  macAddress: string;
  radioGroup: number;
  hubSecret: string;
  images?: string[];
  lat?: number;
  long?: number;
  remarks?: string;
  zoneId?: number;
  facilityId?: number;
}
