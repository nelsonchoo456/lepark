import { Announcement, PrismaClient } from '@prisma/client';
import { AnnouncementSchema, AnnouncementSchemaType } from '../schemas/announcementSchema';
import ParkDao from '../dao/ParkDao';
import AttractionDao from '../dao/AttractionDao';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import AnnouncementDao from '../dao/AnnouncementDao';

const prisma = new PrismaClient();

class AnnouncementService {
  public async createAnnouncement(data: AnnouncementSchemaType): Promise<Announcement> {
    try {
      const formattedData = dateFormatter(data);
      AnnouncementSchema.parse(formattedData);

      // Check if the park exists
      if (formattedData.parkId) {
        const park = await ParkDao.getParkById(formattedData.parkId);
        if (!park) {
          throw new Error('Park not found');
        }
      }
      return AnnouncementDao.createAnnouncement(formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllAnnouncements(): Promise<Announcement[]> {
    return AnnouncementDao.getAllAnnouncements();
  }

  public async getAnnouncementsByParkId(parkId: number): Promise<Announcement[]> {
    const park = await ParkDao.getParkById(parkId);
    if (!park) {
      throw new Error('Park not found');
    }

    return AnnouncementDao.getAnnouncementsByParkId(parkId);
  }

  public async getAnnouncementById(id: string): Promise<Announcement> {
    const announcement = await AnnouncementDao.getAnnouncementById(id);
    if (!announcement) {
      throw new Error('Announcement not found');
    }
    return announcement;
  }

  public async updateAnnouncementDetails(id: string, data: Partial<AnnouncementSchemaType>): Promise<Announcement> {
    try {
      const existingAnnouncement = await AnnouncementDao.getAnnouncementById(id);
      if (!existingAnnouncement) {
        throw new Error('Announcement not found');
      }

      const formattedData = dateFormatter(data);
      const mergedData = { ...existingAnnouncement, ...formattedData };
      AnnouncementSchema.parse(mergedData);

      // Check if the park exists if parkId is being updated
      if (data.parkId) {
        if (data.parkId && data.parkId !== existingAnnouncement.parkId) {
          const park = await ParkDao.getParkById(data.parkId);
          if (!park) {
            throw new Error('Park not found');
          }
        }
      }

      return AnnouncementDao.updateAnnouncementDetails(id, formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteAnnouncement(id: string): Promise<void> {
    await AnnouncementDao.deleteAnnouncement(id);
  }
}

const dateFormatter = (data: any) => {
  const { openingHours, closingHours, ...rest } = data;
  const formattedData = { ...rest };

  if (openingHours) {
    formattedData.openingHours = openingHours.map((time: string) => new Date(time));
  }
  if (closingHours) {
    formattedData.closingHours = closingHours.map((time: string) => new Date(time));
  }

  return formattedData;
};

export default new AnnouncementService();
