import { PrismaClient, Prisma, Occurrence, Species } from '@prisma/client';
import ZoneDao from './ZoneDao';

const prisma = new PrismaClient();

class OccurrenceDao {
  public async createOccurrence(data: Prisma.OccurrenceCreateInput): Promise<Occurrence> {
    return prisma.occurrence.create({ data });
  }

  public async getAllOccurrences(): Promise<Occurrence[]> {
    const occurrences = await prisma.occurrence.findMany({
      include: {
        species: {
          select: {
            id: true,
            speciesName: true,
          },
        },
      },
    });

    const zones = await ZoneDao.getAllZones();

    return occurrences.map((occurrence) => {
      const zone = zones.find((z: any) => z.id === occurrence.zoneId);
      return {
        ...occurrence,
        speciesId: occurrence.species?.id,
        speciesName: occurrence.species?.speciesName,
        zoneId: zone?.id,
        zoneName: zone?.name,
        parkId: zone?.parkId,
        parkName: zone?.parkName,
        parkDescription: zone?.parkDescription,
      };
    });
  }

  public async getAllOccurrencesByZoneId(zoneId: number): Promise<Occurrence[]> {
    const occurrences = await prisma.occurrence.findMany({
      where: {
        zoneId,
      },
      include: {
        species: true,
      },
    });

    return occurrences;
  }

  public async getAllOccurrencesByParkId(parkId: number): Promise<Occurrence[]> {
    const occurrences = await prisma.occurrence.findMany({
      include: {
        species: {
          select: {
            id: true,
            speciesName: true,
          },
        },
      },
    });

    const zones = await ZoneDao.getAllZones();

    return occurrences
      .map((occurrence) => {
        const zone = zones.find((z: any) => z.id === occurrence.zoneId);
        return {
          ...occurrence,
          speciesId: occurrence.species?.id,
          speciesName: occurrence.species?.speciesName,
          zoneId: zone?.id,
          zoneName: zone?.name,
          parkId: zone?.parkId,
          parkName: zone?.parkName,
          parkDescription: zone?.parkDescription,
        };
      })
      .filter((occurrence: any) => occurrence.parkId === parkId);
  }

  public async getSpeciesCountByParkId(
    parkId: number
  ): Promise<number> {
    // Get all zones associated with the parkId
    const zones = await ZoneDao.getAllZones();
    const zoneIds = zones.filter((zone: any) => zone.parkId === parkId).map((zone: any) => zone.id);

    // Group by speciesId and count the number of unique species
    const uniqueSpecies = await prisma.occurrence.groupBy({
      by: ['speciesId'],
      where: {
        zoneId: {
          in: zoneIds,
        },
      },
    });

    // The length of the grouped result will be the number of unique species
    return uniqueSpecies.length;
  }

  public async getOccurrenceById(
    id: string
  ): Promise<Occurrence | null> {
    return prisma.occurrence.findUnique({ where: { id } });
  }

  public async updateOccurrenceDetails(
    id: string, 
    data: Prisma.OccurrenceUpdateInput
  ): Promise<Occurrence> {
    return prisma.occurrence.update({ where: { id }, data });
  }

  public async deleteOccurrence(
    id: string
  ): Promise<void> {
    await prisma.occurrence.delete({ where: { id } });
  }

  public async getOccurrencesByIds(
    ids: string[]
  ): Promise<Occurrence[]> {
    return prisma.occurrence.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}

export default new OccurrenceDao();
