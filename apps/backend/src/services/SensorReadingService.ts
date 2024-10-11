import { SensorReading } from '@prisma/client';
import { z } from 'zod';
import { SensorReadingSchema, SensorReadingSchemaType } from '../schemas/sensorReadingSchema';
import SensorReadingDao from '../dao/SensorReadingDao';
import { fromZodError } from 'zod-validation-error';
import SensorDao from '../dao/SensorDao';

const dateFormatter = (data: any) => {
  const { timestamp, ...rest } = data;
  const formattedData = { ...rest };

  if (timestamp) {
    formattedData.timestamp = new Date(timestamp);
  }
  return formattedData;
};

class SensorReadingService {
  public async createSensorReading(data: SensorReadingSchemaType): Promise<SensorReading> {
    try {
      const sensor = await SensorDao.getSensorById(data.sensorId);
      if (!sensor) {
        throw new Error('Sensor not found');
      }
      const formattedData = dateFormatter(data);
      SensorReadingSchema.parse(formattedData);
      return SensorReadingDao.createSensorReading(formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getSensorReadingById(id: string): Promise<SensorReading> {
    const sensorReading = await SensorReadingDao.getSensorReadingById(id);
    if (!sensorReading) {
      throw new Error('Sensor reading not found');
    }
    return sensorReading;
  }

  public async getSensorReadingsByHubId(hubId: string): Promise<SensorReading[]> {
    return SensorReadingDao.getSensorReadingsByHubId(hubId);
  }

  public async getSensorReadingsBySensorId(sensorId: string): Promise<SensorReading[]> {
    return SensorReadingDao.getSensorReadingsBySensorId(sensorId);
  }

  public async updateSensorReading(id: string, data: Partial<SensorReadingSchemaType>): Promise<SensorReading> {
    try {
      const validatedData = SensorReadingSchema.partial().parse(data);
      const updatedSensorReading = await SensorReadingDao.updateSensorReading(id, validatedData);
      if (!updatedSensorReading) {
        throw new Error('Sensor reading not found');
      }
      return updatedSensorReading;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteSensorReading(id: string): Promise<void> {
    await SensorReadingDao.deleteSensorReading(id);
  }
}

export default new SensorReadingService();
