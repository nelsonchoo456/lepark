import { HubStatusEnum } from '@prisma/client';

export interface HubData {
  serialNumber: string;
  hubName: string;
  hubDescription: string;
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
  image?: string[];
  lat?: number;
  long?: number;
  remarks?: string;
  zoneId?: number;
  facilityId?: number;
}

export interface HubResponse {
  id: string;
  serialNumber: string;
  hubName: string;
  hubDescription: string;
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
  image?: string[];
  lat?: number;
  long?: number;
  remarks?: string;
  zoneId?: number;
  facilityId?: number;
}
