import { ParkResponse } from "./park";
import { SensorStatusEnum, SensorTypeEnum, SensorUnitEnum } from "./sharedenums";

export interface SensorData {
  name: string;
  sensorType: SensorTypeEnum;
  description?: string;
  sensorStatus: SensorStatusEnum;
  acquisitionDate: string;
  calibrationFrequencyDays: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  dataFrequencyMinutes?: number;
  sensorUnit: SensorUnitEnum;
  supplier: string;
  supplierContactNumber: string;
  images?: string[];
  lat?: number;
  long?: number;
  remarks?: string;
  hubId?: string;
  facilityId?: string;
}

export interface SensorResponse {
  id: string;
  name: string;
  serialNumber: string;
  sensorType: SensorTypeEnum;
  description?: string;
  sensorStatus: SensorStatusEnum;
  acquisitionDate: string;
  lastCalibratedDate?: string;
  calibrationFrequencyDays: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  dataFrequencyMinutes: number;
  sensorUnit: SensorUnitEnum;
  supplier: string;
  supplierContactNumber: string;
  images?: string[];
  lat?: number;
  long?: number;
  remarks?: string;
  hubId?: string;
  facilityId?: string;
  hub?: {
    id: string;
    name: string;
    zoneId: string;
  };
  facility?: {
    id: string;
    name: string;
    parkId?: number;
  };
  park: ParkResponse;
}

export interface SensorUpdateData {
  name?: string;
  sensorType?: SensorTypeEnum;
  description?: string;
  sensorStatus?: SensorStatusEnum;
  acquisitionDate?: string;
  lastCalibratedDate?: string;
  calibrationFrequencyDays?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  dataFrequencyMinutes?: number;
  sensorUnit?: SensorUnitEnum;
  supplier?: string;
  supplierContactNumber?: string;
  images?: string[];
  lat?: number;
  long?: number;
  remarks?: string;
  hubId?: string;
  facilityId?: string;
}

export interface SensorMaintenanceHistoryResponse {
  id: string;
  maintenanceDate: string;
  description: string;
  sensorId: string;
  name: string;
}

export interface SensorCalibrationHistoryResponse {
  id: string;
  calibrationDate: string;
  description: string;
  sensorId: string;
  name: string;
}

export interface SensorUsageMetricsResponse {
  id: string;
  uptime: number;
  downtime: number;
  dataVolume: number;
  description: string;
  sensorId: string;
  name: string;
}
