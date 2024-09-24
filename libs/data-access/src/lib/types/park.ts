export interface ParkData {
  name: string;
  description?: string;
  address?: string;
  contactNumber?: string;
  openingHours: any;
  closingHours: any;
  geom: any;
  paths: any;
  parkStatus: string;
  images?: string[];
}
export interface StringIdxSig {
  [key: string]: string | undefined;
}
export interface ParkResponse {
  id: number;
  name: string;
  description?: string;
  address?: string;
  contactNumber?: string;
  openingHours: any;
  closingHours: any;
  geom: any;
  paths: any;
  parkStatus: string;
  images?: string[];
}
