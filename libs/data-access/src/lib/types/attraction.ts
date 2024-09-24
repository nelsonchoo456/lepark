export enum AttractionStatusEnum {
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
  status: AttractionStatusEnum;
  lat: number;
  lng: number;
  parkId: number;
}

export interface CreateAttractionData {
    title: string;
    description: string;
    openingHours: any;
    closingHours: any;
    images?: string[];
    status: AttractionStatusEnum;
    lat: number;
    lng: number;
    parkId: number;
}

export interface UpdateAttractionData {
    title?: string;
    description?: string;
    openingHours?: any;
    closingHours?: any;
    images?: string[];
    status?: AttractionStatusEnum;
    lat?: number;
    lng?: number;
    parkId?: number;
}