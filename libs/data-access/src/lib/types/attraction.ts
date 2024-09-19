export enum AttractionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
}

export interface AttractionResponse {
  id: string;
  title: string;
  description: string;
  openingHours: any;
  closingHours: any;
  images?: string[];
  status: AttractionStatus;
  lat?: number;
  lng?: number;
  parkId: number;
}

export interface CreateAttractionData {
    title: string;
    description: string;
    openingHours: any;
    closingHours: any;
    images?: string[];
    status: AttractionStatus;
    lat?: number;
    lng?: number;
    parkId: number;
}

export interface UpdateAttractionData {
    title?: string;
    description?: string;
    openingHours?: any;
    closingHours?: any;
    images?: string[];
    status?: AttractionStatus;
    lat?: number;
    lng?: number;
    parkId?: number;
}