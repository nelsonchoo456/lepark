import { SensorTypeEnum, SensorStatusEnum, SensorUnitEnum } from '@prisma/client';

export interface SensorData {
  sensorName: string;
  serialNumber: string;
  sensorType: SensorTypeEnum;
  sensorDescription?: string;
  sensorStatus: SensorStatusEnum;
  acquisitionDate: string;
  lastCalibratedDate?: string;
  calibrationFrequencyDays: number;
  recurringMaintenanceDuration: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  dataFrequencyMinutes: number;
  sensorUnit: SensorUnitEnum;
  supplier: string;
  supplierContactNumber: string;
  image?: string;
  latitude?: number;
  longitude?: number;
  remarks?: string;
  hubId?: string;
  facilityId?: string;
}

export interface SensorResponse {
  id: string;
  sensorName: string;
  serialNumber: string;
  sensorType: SensorTypeEnum;
  sensorDescription?: string;
  sensorStatus: SensorStatusEnum;
  acquisitionDate: string;
  lastCalibratedDate?: string;
  calibrationFrequencyDays: number;
  recurringMaintenanceDuration: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  dataFrequencyMinutes: number;
  sensorUnit: SensorUnitEnum;
  supplier: string;
  supplierContactNumber: string;
  images?: string[]; // Changed to array of strings
  latitude?: number;
  longitude?: number;
  remarks?: string;
  hubId?: string;
  facilityId?: string;
  hub?: {
    id: string;
    name: string;
  };
  facility?: {
    id: string;
    facilityName: string;
    parkId?: number;
  };
}

export interface SensorUpdateData {
  sensorName?: string;
  serialNumber?: string;
  sensorType?: SensorTypeEnum;
  sensorDescription?: string;
  sensorStatus?: SensorStatusEnum;
  acquisitionDate?: string;
  lastCalibratedDate?: string;
  calibrationFrequencyDays?: number;
  recurringMaintenanceDuration?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  dataFrequencyMinutes?: number;
  sensorUnit?: SensorUnitEnum;
  supplier?: string;
  supplierContactNumber?: string;
  images?: string[]; // Changed to array of strings
  latitude?: number;
  longitude?: number;
  remarks?: string;
  hubId?: string;
  facilityId?: string;
}


export interface SensorMaintenanceHistoryResponse {
  id: string;
  maintenanceDate: string;
  description: string;
  sensorId: string;
  sensorName: string;
}

export interface SensorCalibrationHistoryResponse {
  id: string;
  calibrationDate: string;
  description: string;
  sensorId: string;
  sensorName: string;
}

export interface SensorUsageMetricsResponse {
  id: string;
  uptime: number;
  downtime: number;
  dataVolume: number;
  description: string;
  sensorId: string;
  sensorName: string;
}
