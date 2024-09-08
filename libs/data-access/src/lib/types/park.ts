export interface ParkData {
  name: string;
  description?: string;
  openingHours: any;
  closingHours: any;
  geom: any;
  paths: any;
  parkStatus: string;
}

export interface ParkResponse {
  id: string;
  name: string;
  description?: string;
  openingHours: any;
  closingHours: any;
  geom: any;
  paths: any;
  parkStatus: string;
}