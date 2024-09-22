import { Event, EventStatusEnum } from '@prisma/client';
import { z } from 'zod';
import { EventSchema, EventSchemaType } from '../schemas/eventSchema';
import EventDao from '../dao/EventDao';
import { fromZodError } from 'zod-validation-error';
import aws from 'aws-sdk';
import FacilityDao from '../dao/FacilityDao';
import ZoneDao from '../dao/ZoneDao';
import ParkDao from '../dao/ParkDao';

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

      // // Check if event title already exists in the facility
      // const existingEvent = await EventDao.getEventByTitleAndFacilityId(formattedData.title, formattedData.facilityId);
      // if (existingEvent) {
      //   throw new Error('An event with this title already exists in the facility');
      // }

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

      // Check if event title already exists in the new facility
      const existingEventInNewFacility = await EventDao.getEventByTitleAndFacilityId(mergedData.title, data.facilityId);
      if (existingEventInNewFacility && existingEventInNewFacility.id !== id) {
        throw new Error('An event with this title already exists in the facility');
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
    await EventDao.deleteEvent(id);
  }

  public async uploadImageToS3(fileBuffer, fileName, mimeType) {
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
