import { PrismaClient, EventTicketTransaction, Prisma, EventTicket, EventTicketStatusEnum } from '@prisma/client';

const prisma = new PrismaClient();

class EventTicketDao {
  // EventTicketTransaction
  async createEventTicketTransaction(data: Prisma.EventTicketTransactionCreateInput): Promise<EventTicketTransaction> {
    return prisma.eventTicketTransaction.create({ data });
  }

  async getEventTicketTransactionById(id: string): Promise<EventTicketTransaction | null> {
    return prisma.eventTicketTransaction.findUnique({
      where: { id },
      include: {
        eventTickets: true,
      },
    });
  }

  async getAllEventTicketTransactions(): Promise<EventTicketTransaction[]> {
    return prisma.eventTicketTransaction.findMany();
  }

  async deleteEventTicketTransaction(id: string): Promise<EventTicketTransaction> {
    return prisma.eventTicketTransaction.delete({ where: { id } });
  }

  async getEventTicketTransactionsByVisitorId(visitorId: string): Promise<EventTicketTransaction[]> {
    return prisma.eventTicketTransaction.findMany({ where: { visitorId } });
  }

  async getEventTicketTransactionsByEventId(eventId: string): Promise<EventTicketTransaction[]> {
    return prisma.eventTicketTransaction.findMany({ where: { eventId } });
  }

  // EventTicket
  async createEventTicket(data: Prisma.EventTicketCreateInput): Promise<EventTicket> {
    return prisma.eventTicket.create({ data });
  }

  async getEventTicketById(id: string): Promise<EventTicket | null> {
    return prisma.eventTicket.findUnique({ where: { id } });
  }

  async getAllEventTickets(): Promise<EventTicket[]> {
    return prisma.eventTicket.findMany();
  }

  async deleteEventTicket(id: string): Promise<EventTicket> {
    return prisma.eventTicket.delete({ where: { id } });
  }

  async getEventTicketsByTransactionId(eventTicketTransactionId: string): Promise<EventTicket[]> {
    return prisma.eventTicket.findMany({ where: { eventTicketTransactionId } });
  }

  async getEventTicketsByListingId(eventTicketListingId: string): Promise<EventTicket[]> {
    return prisma.eventTicket.findMany({
      where: { eventTicketListingId },
    });
  }

  async updateEventTicketStatus(id: string, status: EventTicketStatusEnum): Promise<EventTicket> {
    return prisma.eventTicket.update({
      where: { id },
      data: { status },
    });
  }

  async getEventTicketsByEventId(eventId: string): Promise<EventTicket[]> {
    return prisma.eventTicket.findMany({
      where: {
        eventTicketTransaction: {
          eventId: eventId,
        },
      },
      include: {
        eventTicketTransaction: true,
      },
    });
  }
}

export default new EventTicketDao();