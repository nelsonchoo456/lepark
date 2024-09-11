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
}
export interface StringIdxSig {
  [key: string]: string | undefined
}
export interface ParkResponse {
  id: string;
  name: string;
  description?: string;
  address?: string;
  contactNumber?: string;
  openingHours: any;
  closingHours: any;
  geom: any;
  paths: any;
  parkStatus: string;
}