import { PrismaClient, AttractionTicketTransaction, Prisma, AttractionTicket, AttractionTicketStatusEnum } from '@prisma/client';

const prisma = new PrismaClient();

class AttractionTicketDao {
  // AttractionTicketTransaction
  async createAttractionTicketTransaction(data: Prisma.AttractionTicketTransactionCreateInput): Promise<AttractionTicketTransaction> {
    return prisma.attractionTicketTransaction.create({ data });
  }

  async getAttractionTicketTransactionById(id: string): Promise<AttractionTicketTransaction | null> {
    return prisma.attractionTicketTransaction.findUnique({
      where: { id },
      include: {
        attractionTickets: true,
      },
    });
  }

  async getAllAttractionTicketTransactions(): Promise<AttractionTicketTransaction[]> {
    return prisma.attractionTicketTransaction.findMany();
  }

  async deleteAttractionTicketTransaction(id: string): Promise<AttractionTicketTransaction> {
    return prisma.attractionTicketTransaction.delete({ where: { id } });
  }

  async getAttractionTicketTransactionsByVisitorId(visitorId: string): Promise<AttractionTicketTransaction[]> {
    return prisma.attractionTicketTransaction.findMany({ where: { visitorId } });
  }

  async getAttractionTicketTransactionsByAttractionId(attractionId: string): Promise<AttractionTicketTransaction[]> {
    return prisma.attractionTicketTransaction.findMany({ where: { attractionId } });
  }

  // AttractionTicket
  async createAttractionTicket(data: Prisma.AttractionTicketCreateInput): Promise<AttractionTicket> {
    return prisma.attractionTicket.create({ data });
  }

  async getAttractionTicketById(id: string): Promise<AttractionTicket | null> {
    return prisma.attractionTicket.findUnique({ where: { id } });
  }

  async getAllAttractionTickets(): Promise<AttractionTicket[]> {
    return prisma.attractionTicket.findMany();
  }

  async deleteAttractionTicket(id: string): Promise<AttractionTicket> {
    return prisma.attractionTicket.delete({ where: { id } });
  }

  async getAttractionTicketsByTransactionId(attractionTicketTransactionId: string): Promise<AttractionTicket[]> {
    return prisma.attractionTicket.findMany({ where: { attractionTicketTransactionId } });
  }

  async getAttractionTicketsByListingId(attractionTicketListingId: string): Promise<AttractionTicket[]> {
    return prisma.attractionTicket.findMany({
      where: { attractionTicketListingId },
    });
  }

  async updateAttractionTicketStatus(id: string, status: AttractionTicketStatusEnum): Promise<AttractionTicket> {
    return prisma.attractionTicket.update({
      where: { id },
      data: { status },
    });
  }

  async getAttractionTicketsByAttractionId(attractionId: string): Promise<AttractionTicket[]> {
    return prisma.attractionTicket.findMany({
      where: {
        attractionTicketTransaction: {
          attractionId: attractionId,
        },
      },
      include: {
        attractionTicketTransaction: true,
      },
    });
  }
}

export default new AttractionTicketDao();
