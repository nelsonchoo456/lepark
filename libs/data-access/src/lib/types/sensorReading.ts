import { SensorResponse } from './sensor';

export interface SensorReadingData {
  date: Date;
  value: number;
  sensorId: string;
}

export interface SensorReadingResponse {
  id: string;
  date: Date;
  value: number;
  sensorId: string;
  sensor?: SensorResponse;
}

export interface HeatMapCrowdResponse {
  sensorId: string;
  zoneId: number;
  lat: number;
  long: number;
  averageValue: number;
  readingCount: number;
}

//