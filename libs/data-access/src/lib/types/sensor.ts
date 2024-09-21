import { SensorTypeEnum, SensorStatusEnum, SensorUnitEnum } from '@prisma/client';

export interface SensorData {
  sensorName: string;
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
}

export interface SensorResponse {
  id: string;
  sensorName: string;
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
  hubName?: string;
  facilityId?: string;
  facilityName?: string;
  parkId?: number;
  parkName?: string;
}

export interface SensorUpdateData {
  sensorName?: string;
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
  image?: string;
  latitude?: number;
  longitude?: number;
  remarks?: string;
  hubId?: string;
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
