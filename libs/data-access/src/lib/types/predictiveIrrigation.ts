export interface PredictiveIrrigation {
  hubId: string;
  forecast: string;
  rainfall: number;
  sensorData: {
    [key: string]: number
  }
}