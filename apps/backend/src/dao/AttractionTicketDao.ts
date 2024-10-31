import { PrismaClient, AttractionTicketTransaction, Prisma, AttractionTicket, AttractionTicketStatusEnum } from '@prisma/client';

const prisma = new PrismaClient();

class AttractionTicketDao {
  // AttractionTicketTransaction
  async createAttractionTicketTransaction(
    transactionData: Prisma.AttractionTicketTransactionCreateInput,
    tickets: { listingId: string; quantity: number }[],
  ): Promise<AttractionTicketTransaction> {
    return prisma.$transaction(async (prismaClient) => {
      // Fetch all required listings in one query
      const listingIds = tickets.map((ticket) => ticket.listingId);
      const listings = await prismaClient.attractionTicketListing.findMany({
        where: { id: { in: listingIds } },
      });

      // Create a map for quick price lookup
      const listingPriceMap = new Map(listings.map((listing) => [listing.id, listing.price]));

      // Create the transaction
      return prismaClient.attractionTicketTransaction.create({
        data: {
          ...transactionData,
          attractionTickets: {
            create: tickets.flatMap((ticket) => {
              const price = listingPriceMap.get(ticket.listingId);
              if (price === undefined) {
                throw new Error(`Price not found for listing ID: ${ticket.listingId}`);
              }
              return Array(ticket.quantity).fill({
                price: price,
                status: AttractionTicketStatusEnum.VALID,
                attractionTicketListingId: ticket.listingId,
              });
            }),
          },
        },
        include: {
          attractionTickets: true,
        },
      });
    });
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
