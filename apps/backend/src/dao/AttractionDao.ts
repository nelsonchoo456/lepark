import { PrismaClient, Prisma, Attraction, AttractionTicketListing } from '@prisma/client';

const prisma = new PrismaClient();

class AttractionDao {
  async createAttraction(data: Prisma.AttractionCreateInput): Promise<Attraction> {
    return prisma.attraction.create({ data });
  }

  async getAllAttractions(): Promise<Attraction[]> {
    return prisma.attraction.findMany();
  }

  async getAttractionsByParkId(parkId: number): Promise<Attraction[]> {
    return prisma.attraction.findMany({ where: { parkId } });
  }

  async getAttractionById(id: string): Promise<Attraction | null> {
    return prisma.attraction.findUnique({ where: { id } });
  }

  async updateAttractionDetails(id: string, data: Prisma.AttractionUpdateInput): Promise<Attraction> {
    return prisma.attraction.update({ where: { id }, data });
  }

  async deleteAttraction(id: string): Promise<void> {
    await prisma.attraction.delete({ where: { id } });
  }

  async getAttractionByTitleAndParkId(title: string, parkId: number): Promise<Attraction | null> {
    return prisma.attraction.findFirst({ where: { title, parkId } });
  }

  async createAttractionTicketListing(data: Prisma.AttractionTicketListingCreateInput): Promise<AttractionTicketListing> {
    return prisma.attractionTicketListing.create({ data });
  }

  async getAllAttractionTicketListings(): Promise<AttractionTicketListing[]> {
    return prisma.attractionTicketListing.findMany();
  }

  async getAttractionTicketListingsByAttractionId(attractionId: string): Promise<AttractionTicketListing[]> {
    return prisma.attractionTicketListing.findMany({ where: { attractionId } });
  }

  async getAttractionTicketListingById(id: string): Promise<AttractionTicketListing | null> {
    return prisma.attractionTicketListing.findUnique({ where: { id } });
  }

  async updateAttractionTicketListing(id: string, data: Prisma.AttractionTicketListingUpdateInput): Promise<AttractionTicketListing> {
    return prisma.attractionTicketListing.update({ where: { id }, data });
  }

  async deleteAttractionTicketListing(id: string): Promise<void> {
    await prisma.attractionTicketListing.delete({ where: { id } });
  }
}

export default new AttractionDao();