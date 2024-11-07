import { Attraction, AttractionTicketListing } from '@prisma/client';
import { z } from 'zod';
import { AttractionSchema, AttractionSchemaType, AttractionTicketListingSchema, AttractionTicketListingSchemaType } from '../schemas/attractionSchema';
import AttractionDao from '../dao/AttractionDao';
import { fromZodError } from 'zod-validation-error';
import aws from 'aws-sdk';
import ParkDao from '../dao/ParkDao';
import AttractionTicketDao from '../dao/AttractionTicketDao';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

class AttractionService {
  public async createAttraction(data: AttractionSchemaType): Promise<Attraction> {
    try {
      const formattedData = dateFormatter(data);
      AttractionSchema.parse(formattedData);

      // Check if the park exists
      const park = await ParkDao.getParkById(formattedData.parkId);
      if (!park) {
        throw new Error('Park not found');
      }

      // Check if attraction name already exists in the park
      const existingAttraction = await AttractionDao.getAttractionByTitleAndParkId(formattedData.title, formattedData.parkId);
      if (existingAttraction) {
        throw new Error('An attraction with this title already exists in the park');
      }

      // // Validate coordinates are within park boundaries
      // if (!this.isWithinParkBoundaries(formattedData.lat, formattedData.lng, park.geom)) {
      //   throw new Error('Attraction coordinates are outside the park boundaries');
      // }

      return AttractionDao.createAttraction(formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async checkAttractionNameExists(parkId: number, title: string): Promise<boolean> {
    try {
      if (!parkId || !title) {
        throw new Error('Park ID and attraction title are required');
      }

      const park = await ParkDao.getParkById(parkId);
      if (!park) {
        throw new Error('Park not found');
      }

      return await AttractionDao.checkAttractionNameExists(parkId, title);
    } catch (error) {
      // Log the error for debugging
      console.error('Error in checkAttractionNameExists:', error);

      // Rethrow the error or throw a generic error
      throw new Error('An error occurred while checking the attraction name');
    }
  }

  public async getAllAttractions(): Promise<Attraction[]> {
    return AttractionDao.getAllAttractions();
  }

  public async getAttractionsByParkId(parkId: number): Promise<Attraction[]> {
    const park = await ParkDao.getParkById(parkId);
    if (!park) {
      throw new Error('Park not found');
    }
    
    return AttractionDao.getAttractionsByParkId(parkId);
  }

  public async getAttractionById(id: string): Promise<Attraction> {
    const attraction = await AttractionDao.getAttractionById(id);
    if (!attraction) {
      throw new Error('Attraction not found');
    }
    return attraction;
  }

  public async updateAttractionDetails(id: string, data: Partial<AttractionSchemaType>): Promise<Attraction> {
    try {
      const existingAttraction = await AttractionDao.getAttractionById(id);
      if (!existingAttraction) {
        throw new Error('Attraction not found');
      }

      const formattedData = dateFormatter(data);
      const mergedData = { ...existingAttraction, ...formattedData };
      AttractionSchema.parse(mergedData);

      // Check if the park exists if parkId is being updated
      if (data.parkId && data.parkId !== existingAttraction.parkId) {
        const park = await ParkDao.getParkById(data.parkId);
        if (!park) {
          throw new Error('Park not found');
        }
      }

      // Check if attraction name already exists in the new park
      const existingAttractionInNewPark = await AttractionDao.getAttractionByTitleAndParkId(mergedData.title, data.parkId);
      if (existingAttractionInNewPark && existingAttractionInNewPark.id !== id) {
        throw new Error('An attraction with this title already exists in the park');
      }

      //  // Validate coordinates are within new park boundaries
      //  if (!this.isWithinParkBoundaries(mergedData.lat, mergedData.lng, park.geom)) {
      //   throw new Error('Attraction coordinates are outside the new park boundaries');
      // }

      //       // Validate coordinates are within new park boundaries
      //       if (!this.isWithinParkBoundaries(mergedData.lat, mergedData.lng, park.geom)) {
      //         throw new Error('Attraction coordinates are outside the new park boundaries');
      //       }
      //     } else if (data.name && data.name !== existingAttraction.name) {
      //       // Check if the new name already exists in the current park
      //       const existingAttractionWithNewName = await AttractionDao.getAttractionByNameAndParkId(data.name, existingAttraction.parkId);
      //       if (existingAttractionWithNewName && existingAttractionWithNewName.id !== id) {
      //         throw new Error('An attraction with this name already exists in the park');
      //       }
      //     }

      //     // If coordinates are being updated, check if they're within park boundaries
      //     if ((data.lat !== undefined && data.lat !== existingAttraction.lat) ||
      //         (data.lng !== undefined && data.lng !== existingAttraction.lng)) {
      //       const park = await ParkDao.getParkById(existingAttraction.parkId);
      //       if (!this.isWithinParkBoundaries(mergedData.lat, mergedData.lng, park.geom)) {
      //         throw new Error('New attraction coordinates are outside the park boundaries');
      //       }
      //     }

      return AttractionDao.updateAttractionDetails(id, formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteAttraction(id: string): Promise<void> {
    // check if attraction has any transactions
    const attraction = await AttractionDao.getAttractionById(id);
    const transactions = await AttractionTicketDao.getAttractionTicketTransactionsByAttractionId(id);
    if (transactions.length > 0) {
      throw new Error('Attraction has existing visitor transactions and cannot be deleted');
    } else {
      await AttractionDao.deleteAttraction(id);
    }
  }

  public async uploadImageToS3(fileBuffer, fileName, mimeType) {
    const params = {
      Bucket: 'lepark',
      Key: `attraction/${fileName}`,
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

  public async createAttractionTicketListing(data: AttractionTicketListingSchemaType): Promise<AttractionTicketListing> {
    try {
      const formattedData = dateFormatter(data);
      AttractionTicketListingSchema.parse(formattedData);

      // Check if the attraction exists
      const attraction = await AttractionDao.getAttractionById(formattedData.attractionId);
      if (!attraction) {
        throw new Error('Attraction not found');
      }

      return AttractionDao.createAttractionTicketListing(formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllAttractionTicketListings(): Promise<AttractionTicketListing[]> {
    return AttractionDao.getAllAttractionTicketListings();
  }

  public async getAttractionTicketListingsByAttractionId(attractionId: string): Promise<AttractionTicketListing[]> {
    return AttractionDao.getAttractionTicketListingsByAttractionId(attractionId);
  }

  public async getAttractionTicketListingById(id: string): Promise<AttractionTicketListing> {
    return AttractionDao.getAttractionTicketListingById(id);
  }

  public async updateAttractionTicketListingDetails(id: string, data: Partial<AttractionTicketListingSchemaType>): Promise<AttractionTicketListing> {
    try {
      const existingTicketListing = await AttractionDao.getAttractionTicketListingById(id);
      if (!existingTicketListing) {
        throw new Error('Ticket listing not found');
      }

      // Merge existing data with updates before validation
      const mergedData = { ...existingTicketListing, ...data };
      AttractionTicketListingSchema.parse(mergedData);
      
      return AttractionDao.updateAttractionTicketListingDetails(id, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteAttractionTicketListing(id: string): Promise<void> {
    await AttractionDao.deleteAttractionTicketListing(id);
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

export default new AttractionService();
