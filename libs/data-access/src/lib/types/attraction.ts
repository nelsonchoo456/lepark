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
  ticketingPolicy: string;
  lat: number;
  lng: number;
  parkId: number;

  cameraSensorId?: string;
}

export interface CreateAttractionData {
  title: string;
  description: string;
  openingHours: any;
  closingHours: any;
  images?: string[];
  status: AttractionStatusEnum;
  ticketingPolicy: string;
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
  ticketingPolicy?: string;
  lat?: number;
  lng?: number;
  parkId?: number;

  cameraSensorId?: string;
}

export enum AttractionTicketCategoryEnum {
  ADULT = 'ADULT',
  CHILD = 'CHILD',
  SENIOR = 'SENIOR',
  STUDENT = 'STUDENT',
}

export enum AttractionTicketNationalityEnum {
  LOCAL = 'LOCAL',
  STANDARD = 'STANDARD',
}

export interface AttractionTicketListingResponse {
  id: string;
  category: AttractionTicketCategoryEnum;
  nationality: AttractionTicketNationalityEnum;
  description: string;
  price: number;
  isActive: boolean;
  attractionId: string;
}

export interface CreateAttractionTicketListingData {
  category: AttractionTicketCategoryEnum;
  nationality: AttractionTicketNationalityEnum;
  description: string;
  price: number;
  isActive: boolean;
  attractionId: string;
}

export interface UpdateAttractionTicketListingData {
  category?: AttractionTicketCategoryEnum;
  nationality?: AttractionTicketNationalityEnum;
  description?: string;
  price?: number;
  isActive?: boolean;
  attractionId?: string;
}