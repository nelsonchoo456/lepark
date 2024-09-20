import { Attraction } from '@prisma/client';
import { z } from 'zod';
import { AttractionSchema, AttractionSchemaType } from '../schemas/attractionSchema';
import AttractionDao from '../dao/AttractionDao';
import { fromZodError } from 'zod-validation-error';
import aws from 'aws-sdk';
import ParkDao from '../dao/ParkDao';

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

  public async getAllAttractions(): Promise<Attraction[]> {
    return AttractionDao.getAllAttractions();
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
    await AttractionDao.deleteAttraction(id);
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
