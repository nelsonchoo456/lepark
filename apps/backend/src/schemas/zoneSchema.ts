export interface ZoneCreateData {
  name: string;
  description?: string;
  openingHours: Date[];
  closingHours: Date[];
  geom: string;
  paths?: string;
  zoneStatus: 'OPEN' | 'CLOSED' | 'UNDER_CONSTRUCTION' | 'LIMITED_ACCESS';
  parkId: number;
  images?: string[];
}

export interface ZoneUpdateData {
  name?: string;
  description?: string;
  openingHours?: Date[];
  closingHours?: Date[];
  geom?: string;
  paths?: string;
  zoneStatus?: 'OPEN' | 'CLOSED' | 'UNDER_CONSTRUCTION' | 'LIMITED_ACCESS';
  parkId?: number;
  images?: string[];
}

export interface ZoneResponseData {
  id: number;
  name: string;
  description?: string;
  openingHours: Date[];
  closingHours: Date[];
  geom: string;
  paths?: string;
  zoneStatus: 'OPEN' | 'CLOSED' | 'UNDER_CONSTRUCTION' | 'LIMITED_ACCESS';
  parkId: number;
  parkName: string;
  parkDescription: string;
  images?: string[];
}
