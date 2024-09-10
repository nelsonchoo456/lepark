export interface ZoneData {
  name: string;
  description?: string;
  openingHours: any;
  closingHours: any;
  geom?: any;
  paths?: any;
  zoneStatus: string;
  parkId: number;
}

export interface ZoneResponse {
  id: string;
  name: string;
  description?: string;
  address?: string;
  contactNumber?: string;
  openingHours: any;
  closingHours: any;
  geom: any;
  paths: any;
  zoneStatus: string;
  parkId: number;
}