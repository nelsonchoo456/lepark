import { PrismaClient, Prisma, Attraction, AttractionTicketListing } from '@prisma/client';

const prisma = new PrismaClient();

class AttractionDao {
  public async createAttraction(
    data: Prisma.AttractionCreateInput
  ): Promise<Attraction> {
    return prisma.attraction.create({ data });
  }

  public async checkAttractionNameExists(
    parkId: number, 
    title: string
  ): Promise<boolean> {
    const count = await prisma.attraction.count({
      where: {
        parkId,
        title: {
          equals: title,
          mode: 'insensitive', // This makes the search case-insensitive
        },
      },
    });
    return count > 0;
  }

  public async getAllAttractions(): Promise<Attraction[]> {
    return prisma.attraction.findMany();
  }

  public async getAttractionsByParkId(
    parkId: number
  ): Promise<Attraction[]> {
    return prisma.attraction.findMany({ where: { parkId } });
  }

  public async getAttractionCountByParkId(
    parkId: number
  ): Promise<number> {
    return prisma.attraction.count({
      where: { parkId },
    });
  }

  public async getAttractionById(
    id: string
  ): Promise<Attraction | null> {
    return prisma.attraction.findUnique({ where: { id } });
  }

  public async updateAttractionDetails(
    id: string, 
    data: Prisma.AttractionUpdateInput
  ): Promise<Attraction> {
    return prisma.attraction.update({ where: { id }, data });
  }

  public async deleteAttraction(
    id: string
  ): Promise<void> {
    await prisma.attraction.delete({ where: { id } });
  }

  public async getAttractionByTitleAndParkId(
    title: string, 
    parkId: number
  ): Promise<Attraction | null> {
    return prisma.attraction.findFirst({ where: { title, parkId } });
  }

  public async createAttractionTicketListing(
    data: Prisma.AttractionTicketListingCreateInput
  ): Promise<AttractionTicketListing> {
    return prisma.attractionTicketListing.create({ data });
  }

  public async getAllAttractionTicketListings(): Promise<AttractionTicketListing[]> {
    return prisma.attractionTicketListing.findMany();
  }

  public async getAttractionTicketListingsByAttractionId(
    attractionId: string
  ): Promise<AttractionTicketListing[]> {
    return prisma.attractionTicketListing.findMany({ where: { attractionId } });
  }

  public async getAttractionTicketListingById(
    id: string
  ): Promise<AttractionTicketListing | null> {
    return prisma.attractionTicketListing.findUnique({ where: { id } });
  }

  public async getAttractionTicketListingByAttractionId(
    attractionId: string
  ): Promise<AttractionTicketListing | null> {
    return prisma.attractionTicketListing.findFirst({ where: { attractionId } });
  }

  public async updateAttractionTicketListingDetails(
    id: string, 
    data: Prisma.AttractionTicketListingUpdateInput
  ): Promise<AttractionTicketListing> {
    return prisma.attractionTicketListing.update({ where: { id }, data });
  }

  public async deleteAttractionTicketListing(
    id: string
  ): Promise<void> {
    await prisma.attractionTicketListing.delete({ where: { id } });
  }
}

export default new AttractionDao();