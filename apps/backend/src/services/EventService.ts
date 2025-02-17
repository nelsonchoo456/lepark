import { Event, EventStatusEnum, EventTicketListing } from '@prisma/client';
import { z } from 'zod';
import { EventSchema, EventSchemaType, EventTicketListingSchema, EventTicketListingSchemaType } from '../schemas/eventSchema';
import EventDao from '../dao/EventDao';
import { fromZodError } from 'zod-validation-error';
import aws from 'aws-sdk';
import FacilityDao from '../dao/FacilityDao';
import ZoneDao from '../dao/ZoneDao';
import ParkDao from '../dao/ParkDao';
import EventTicketDao from '../dao/EventTicketDao';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

class EventService {
  public async createEvent(data: EventSchemaType): Promise<Event> {
    try {
      const formattedData = dateFormatter(data);
      EventSchema.parse(formattedData);

      // Check if the facility exists
      const facility = await FacilityDao.getFacilityById(formattedData.facilityId);
      if (!facility) {
        throw new Error('Facility not found');
      }

      // Check if end date is not before start date
      if (formattedData.endDate <= formattedData.startDate) {
        throw new Error('End date must be after start date');
      }

      // Check if event is in the past
      if (formattedData.startDate < new Date()) {
        throw new Error('Cannot create events in the past');
      }

      // Check for overlapping events in the same facility
      const hasOverlap = await checkEventOverlap(formattedData.facilityId, formattedData.startDate, formattedData.endDate);
      if (hasOverlap) {
        throw new Error('There is already an event scheduled at this facility during the specified dates');
      }

      //  // Check facility availability
      //  const isAvailable = await this.checkFacilityAvailability(formattedData.facilityId, formattedData.startDate, formattedData.endDate);
      //  if (!isAvailable) {
      //    throw new Error('Facility is not available during the specified time slot');
      //  }

      return EventDao.createEvent(formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllEvents(): Promise<Event[]> {
    const events = await EventDao.getAllEvents();
    return Promise.all(events.map(updateEventStatus));
  }

  public async getEventsByParkId(parkId: string): Promise<Event[]> {
    const events = await EventDao.getEventsByParkId(parkId);
    return Promise.all(events.map(updateEventStatus));
  }

  public async getEventCountByParkId(parkId: string): Promise<number> {
    const count = await EventDao.getEventCountByParkId(parkId);
    return count;
  }

  public async getEventsByFacilityId(facilityId: string): Promise<Event[]> {
    const facility = await FacilityDao.getFacilityById(facilityId);
    if (!facility) {
      throw new Error('Facility not found');
    }

    const events = await EventDao.getEventsByFacilityId(facilityId);
    return Promise.all(events.map(updateEventStatus));
  }

  public async getEventById(id: string): Promise<Event & { parkName?: string }> {
    try {
      const event = await EventDao.getEventById(id);
      if (!event) {
        throw new Error('Event not found');
      }
      // const facility = await FacilityDao.getFacilityById(event.facilityId);
      // if (!facility) {
      //   throw new Error('Facility not found');
      // }
      // const park = await ParkDao.getParkById(facility.parkId);
      // if (!park) {
      //   throw new Error('Park not found');
      // }
      return updateEventStatus(event);
      //return { ...event, parkName: park.name };
    } catch (error) {
      throw new Error(`Unable to fetch event details: ${error.message}`);
    }
  }

  public async updateEventDetails(id: string, data: Partial<EventSchemaType>): Promise<Event> {
    try {
      const existingEvent = await EventDao.getEventById(id);
      if (!existingEvent) {
        throw new Error('Event not found');
      }

      const formattedData = dateFormatter(data);
      const mergedData = { ...existingEvent, ...formattedData };
      EventSchema.parse(mergedData);

      // Check if the facility exists if facilityId is being updated
      if (data.facilityId && data.facilityId !== existingEvent.facilityId) {
        const facility = await FacilityDao.getFacilityById(data.facilityId);
        if (!facility) {
          throw new Error('Facility not found');
        }
      }

      // If dates are being updated, recheck availability
      if (data.startDate || data.endDate) {
        const startDate = data.startDate ? new Date(data.startDate) : existingEvent.startDate;
        const endDate = data.endDate ? new Date(data.endDate) : existingEvent.endDate;

        // Recheck for overlapping events
        const hasOverlap = await checkEventOverlap(mergedData.facilityId, startDate, endDate, id);
        if (hasOverlap) {
          throw new Error('There is already an event scheduled at this facility during the specified time');
        }
      }

      return EventDao.updateEventDetails(id, formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteEvent(id: string): Promise<void> {
    // Check if event has any transactions
    const event = await EventDao.getEventById(id);
    if (!event) {
      throw new Error('Event not found');
    }

    const transactions = await EventTicketDao.getEventTicketTransactionsByEventId(id);
    if (transactions.length > 0) {
      throw new Error('Event has existing visitor transactions and cannot be deleted');
    }

    await EventDao.deleteEvent(id);
  }

  public async createEventTicketListing(data: EventTicketListingSchemaType): Promise<EventTicketListing> {
    try {
      const formattedData = dateFormatter(data);
      EventTicketListingSchema.parse(formattedData);

      // Check if the event exists
      const event = await EventDao.getEventById(formattedData.eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      return EventDao.createEventTicketListing(formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllEventTicketListings(): Promise<EventTicketListing[]> {
    return EventDao.getAllEventTicketListings();
  }

  public async getEventTicketListingsByEventId(eventId: string): Promise<EventTicketListing[]> {
    return EventDao.getEventTicketListingsByEventId(eventId);
  }

  public async getEventTicketListingById(id: string): Promise<EventTicketListing> {
    const listing = await EventDao.getEventTicketListingById(id);
    if (!listing) {
      throw new Error('Event ticket listing not found');
    }
    return listing;
  }

  public async updateEventTicketListingDetails(id: string, data: Partial<EventTicketListingSchemaType>): Promise<EventTicketListing> {
    try {
      const existingListing = await EventDao.getEventTicketListingById(id);
      if (!existingListing) {
        throw new Error('Event ticket listing not found');
      }

      EventTicketListingSchema.parse({ ...existingListing, ...data });
      return EventDao.updateEventTicketListingDetails(id, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteEventTicketListing(id: string): Promise<void> {
    await EventDao.deleteEventTicketListing(id);
  }

  public async uploadImageToS3(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const params = {
      Bucket: 'lepark',
      Key: `event/${fileName}`,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    try {
      const data = await s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new Error('Error uploading image to S3');
    }
  }
}

const checkEventOverlap = async (facilityId: string, startDate: Date, endDate: Date, eventId?: string): Promise<boolean> => {
  const overlappingEvents = await EventDao.getEventsByFacilityId(facilityId);
  return overlappingEvents.some((event) => {
    const eventStartDate = new Date(event.startDate);
    const eventEndDate = new Date(event.endDate);
    return startDate < eventEndDate && endDate > eventStartDate && event.id !== eventId;
  });
};

const updateEventStatus = async (event: Event): Promise<Event> => {
  if (event.status === EventStatusEnum.CANCELLED) {
    return event;
  }

  const now = new Date();
  const startDateTime = new Date(event.startDate);
  const endDateTime = new Date(event.endDate);

  let newStatus = event.status;

  if (now < startDateTime) {
    newStatus = EventStatusEnum.UPCOMING;
  } else if (now >= startDateTime && now <= endDateTime) {
    newStatus = EventStatusEnum.ONGOING;
  } else if (now > endDateTime) {
    newStatus = EventStatusEnum.COMPLETED;
  }

  if (newStatus !== event.status) {
    return await EventDao.updateEventStatus(event.id, newStatus);
  }

  return event;
};

const dateFormatter = (data: any) => {
  const { startDate, endDate, startTime, endTime, ...rest } = data;
  const formattedData = { ...rest };

  if (startDate) {
    formattedData.startDate = new Date(startDate);
  }
  if (endDate) {
    formattedData.endDate = new Date(endDate);
  }
  if (startTime) {
    formattedData.startTime = new Date(startTime);
  }
  if (endTime) {
    formattedData.endTime = new Date(endTime);
  }

  return formattedData;
};

export default new EventService();
