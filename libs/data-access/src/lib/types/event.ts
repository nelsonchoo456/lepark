import { FacilityResponse } from "./facility";

export enum EventStatusEnum {
  ONGOING = 'ONGOING',
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum EventTypeEnum {
  WORKSHOP = 'WORKSHOP',
  EXHIBITION = 'EXHIBITION',
  GUIDED_TOUR = 'GUIDED_TOUR',
  PERFORMANCE = 'PERFORMANCE',
  TALK = 'TALK',
  COMPETITION = 'COMPETITION',
  FESTIVAL = 'FESTIVAL',
  CONFERENCE = 'CONFERENCE',
}

export enum EventSuitabilityEnum {
  ANYONE = 'ANYONE',
  FAMILIES_AND_FRIENDS = 'FAMILIES_AND_FRIENDS',
  CHILDREN = 'CHILDREN',
  NATURE_ENTHUSIASTS = 'NATURE_ENTHUSIASTS',
  PETS = 'PETS',
  FITNESS_ENTHUSIASTS = 'FITNESS_ENTHUSIASTS',
}

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  type: EventTypeEnum;
  suitability: EventSuitabilityEnum;
  startDate: any;
  endDate: any;
  startTime: any;
  endTime: any;
  maxCapacity: number;
  ticketingPolicy: string;
  images?: string[];
  status: EventStatusEnum;
  facilityId: string;
  facility?: FacilityResponse;
  //parkName: string;
}

export interface CreateEventData {
    title: string;
    description: string;
    type: EventTypeEnum;
    suitability: EventSuitabilityEnum;
    startDate: any;
    endDate: any;
    startTime: any;
    endTime: any;
    maxCapacity: number;
    ticketingPolicy: string;
    images?: string[];
    status: EventStatusEnum;
    facilityId: string;
}

export interface UpdateEventData {
    title?: string;
    description?: string;
    type?: EventTypeEnum;
    suitability?: EventSuitabilityEnum;
    startDate?: any;
    endDate?: any;
    startTime?: any;
    endTime?: any;
    maxCapacity?: number;
    ticketingPolicy?: string;
    images?: string[];
    status?: EventStatusEnum;
    facilityId?: string;
}

export enum EventTicketCategoryEnum {
  ADULT = 'ADULT',
  CHILD = 'CHILD',
  SENIOR = 'SENIOR',
  STUDENT = 'STUDENT',
}

export enum EventTicketNationalityEnum {
  LOCAL = 'LOCAL',
  STANDARD = 'STANDARD',
}

export interface EventTicketListingResponse {
  id: string;
  category: EventTicketCategoryEnum;
  nationality: EventTicketNationalityEnum;
  description: string;
  price: number;
  isActive: boolean;
  eventId: string;
}

export interface CreateEventTicketListingData {
  category: EventTicketCategoryEnum;
  nationality: EventTicketNationalityEnum;
  description: string;
  price: number;
  isActive: boolean;
  eventId: string;
}

export interface UpdateEventTicketListingData {
  category?: EventTicketCategoryEnum;
  nationality?: EventTicketNationalityEnum;
  description?: string;
  price?: number;
  isActive?: boolean;
  eventId?: string;
}