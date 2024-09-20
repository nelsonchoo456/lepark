export interface ZoneCreateData {
  name: string;
  description?: string;
  openingHours: Date[];
  closingHours: Date[];
  geom: string;
  paths?: string;
  zoneStatus: 'OPEN' | 'CLOSED' | 'UNDER_CONSTRUCTION' | 'LIMITED_ACCESS';
  parkId: number;
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
  parkId: string;
}
