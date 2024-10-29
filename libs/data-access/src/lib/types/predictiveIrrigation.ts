export interface PredictiveIrrigation {
  hubId: string;
  forecast: string;
  irrigate: number;
  sensorData: {
    [key: string]: number
  }
}