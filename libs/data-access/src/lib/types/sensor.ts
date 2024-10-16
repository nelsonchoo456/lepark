import { FacilityResponse } from './facility';
import { HubResponse } from './hub';
import { ParkResponse } from './park';
import { SensorReadingResponse } from './sensorreading';
import { SensorStatusEnum, SensorTypeEnum, SensorUnitEnum } from './sharedenums';

export interface SensorData {
  name: string;
  serialNumber: string;
  sensorType: SensorTypeEnum;
  description?: string;
  sensorStatus: SensorStatusEnum;
  acquisitionDate: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
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
  identifierNumber: string;
  sensorType: SensorTypeEnum;
  description?: string;
  sensorStatus: SensorStatusEnum;
  acquisitionDate: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  sensorUnit: SensorUnitEnum;
  supplier: string;
  supplierContactNumber: string;
  images?: string[];
  lat?: number;
  long?: number;
  remarks?: string | null;
  hubId?: string;
  facilityId?: string;
  hub?: HubResponse;
  facility?: FacilityResponse;
  park?: ParkResponse;
  parkName?: string;
  sensorReadings?: SensorReadingResponse[];
}

export interface SensorUpdateData {
  name?: string;
  serialNumber?: string;
  sensorType?: SensorTypeEnum;
  description?: string;
  sensorStatus?: SensorStatusEnum;
  acquisitionDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
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

export interface SensorUsageMetricsResponse {
  id: string;
  uptime: number;
  downtime: number;
  dataVolume: number;
  description: string;
  sensorId: string;
  name: string;
}
