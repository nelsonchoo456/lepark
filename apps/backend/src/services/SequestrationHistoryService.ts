import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import SequestrationHistoryDao from '../dao/SequestrationHistoryDao';
import { Prisma, SequestrationHistory } from '@prisma/client';
import { SequestrationHistorySchema, SequestrationHistorySchemaType } from '../schemas/sequestrationHistorySchema';
import DecarbonizationAreaService from './DecarbonizationAreaService';

class SequestrationHistoryService {
  private sequestrationFactors = {
    TREE_TROPICAL: 0.47,
    TREE_MANGROVE: 0.44,
    SHRUB: 0.5,
  };

  private CO2_SEQUESTRATION_FACTOR = 3.67;

  private calculateSequestration(numberOfPlants: number, biomass: number, decarbonizationType: string): number {
    const carbonFraction = this.sequestrationFactors[decarbonizationType];
    const annualSequestration = numberOfPlants * biomass * carbonFraction * this.CO2_SEQUESTRATION_FACTOR;
    return annualSequestration / 365; // Convert annual sequestration to daily rate
  }

  public async createSequestrationHistory(data: SequestrationHistorySchemaType): Promise<SequestrationHistory> {
    try {
      // Format date fields
      const formattedData = this.dateFormatter(data);

      // Validate input data using Zod
      SequestrationHistorySchema.parse(formattedData);

      // Convert validated data to Prisma input type
      const seqData = formattedData as Prisma.SequestrationHistoryCreateInput;
      return await SequestrationHistoryDao.createSequestrationHistory(seqData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async updateSequestrationHistory(id: string, data: Partial<SequestrationHistorySchemaType>): Promise<SequestrationHistory> {
    try {
      // Format date fields
      const formattedData = this.dateFormatter(data);

      // Validate input data using Zod
      SequestrationHistorySchema.parse(formattedData);

      return await SequestrationHistoryDao.updateSequestrationHistory(id, formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteSequestrationHistory(id: string): Promise<void> {
    await SequestrationHistoryDao.deleteSequestrationHistory(id);
  }

  public async getSequestrationHistoryByAreaId(areaId: string): Promise<SequestrationHistory[]> {
    return await SequestrationHistoryDao.getSequestrationHistoryByAreaId(areaId);
  }

  public async getSequestrationHistoryByAreaIdAndTimeFrame(
    areaId: string,
    startDate: string,
    endDate: string,
  ): Promise<SequestrationHistory[]> {
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      throw new Error('Invalid date format');
    }

    return await SequestrationHistoryDao.getSequestrationHistoryByAreaIdAndTimeFrame(areaId, parsedStartDate, parsedEndDate);
  }

  public async generateSequestrationHistory() {
    const decarbonizationAreas = await DecarbonizationAreaService.getAllDecarbonizationAreas();

    for (const area of decarbonizationAreas) {
      await this.generateSequestrationHistoryForArea(area.id);
    }
  }

  public async generateSequestrationHistoryForArea(decarbonizationAreaId: string) {
    const occurrences = await DecarbonizationAreaService.getOccurrencesWithinDecarbonizationArea(decarbonizationAreaId);
    let totalSequestration = 0;

    for (const occurrence of occurrences) {
      const { numberOfPlants, biomass, decarbonizationType } = occurrence;
      const sequestration = this.calculateSequestration(numberOfPlants, biomass, decarbonizationType);
      totalSequestration += sequestration;
    }

    const sequestrationHistoryData = {
      date: new Date(),
      seqValue: totalSequestration,
      decarbonizationAreaId,
    };

    // Replace any existing report for today
    await SequestrationHistoryDao.deleteSequestrationHistoryForDate(decarbonizationAreaId, new Date());
    await this.createSequestrationHistory(sequestrationHistoryData);
  }
public async getTotalSequestrationForParkAndDate(parkId: number, date: string): Promise<number> {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date format');
  }

  console.log('Fetching total sequestration for park:', parkId, 'and date:', parsedDate);
  const result = await SequestrationHistoryDao.getTotalSequestrationForParkAndDate(parkId, parsedDate);
  console.log('Total sequestration result:', result);
  return result;
}

  // Utility function to format date fields
  private dateFormatter(data: any) {
    const { date, ...rest } = data;
    const formattedData = { ...rest };

    // Format date into JavaScript Date object
    const dateFormat = date ? new Date(date) : undefined;
    if (date) {
      formattedData.date = dateFormat;
    }
    return formattedData;
  }

  public async getTotalSequestrationForParkAndYear(parkId: number, year: string): Promise<number> {
  const parsedYear = parseInt(year, 10);
  if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
    throw new Error('Invalid year format');
  }


  const result = await SequestrationHistoryDao.getTotalSequestrationForParkAndYear(parkId, parsedYear);

  return result;
}


}

export default new SequestrationHistoryService();
