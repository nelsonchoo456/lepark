export interface ZoneData {
  name: string;
  description?: string;
  openingHours: any;
  closingHours: any;
  geom?: any;
  paths?: any;
  zoneStatus: 'OPEN' | 'CLOSED' | 'UNDER_CONSTRUCTION' | 'LIMITED_ACCESS';
  images?: string[];
  parkId: number;
}

export interface ZoneResponse {
  id: string;
  name: string;
  description?: string;
  openingHours: any;
  closingHours: any;
  geom: any;
  paths: any;
  zoneStatus: 'OPEN' | 'CLOSED' | 'UNDER_CONSTRUCTION' | 'LIMITED_ACCESS';
  images?: string[];
  parkId: number;
  parkName: string;
  parkDescription: string;
}