import { PrismaClient, Prisma, Occurrence } from '@prisma/client';
import ZoneDao from './ZoneDao';

const prisma = new PrismaClient();

class OccurrenceDao {
  async createOccurrence(data: Prisma.OccurrenceCreateInput): Promise<Occurrence> {
    return prisma.occurrence.create({ data });
  }

  async getAllOccurrences(): Promise<Occurrence[]> {
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

  async getAllOccurrencesByParkId(parkId: number): Promise<Occurrence[]> {
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

  async getOccurrenceById(id: string): Promise<Occurrence> {
    return prisma.occurrence.findUnique({ where: { id } });
  }

  async updateOccurrenceDetails(id: string, data: Prisma.OccurrenceUpdateInput): Promise<Occurrence> {
    return prisma.occurrence.update({ where: { id }, data });
  }

  async deleteOccurrence(id: string): Promise<void> {
    await prisma.occurrence.delete({ where: { id } });
  }
}

export default new OccurrenceDao();
