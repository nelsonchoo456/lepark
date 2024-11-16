import { PrismaClient, Prisma, Event, EventStatusEnum, EventTicketListing } from '@prisma/client';

const prisma = new PrismaClient();

class EventDao {
  public async createEvent(data: Prisma.EventCreateInput): Promise<Event> {
    return prisma.event.create({ data });
  }

  public async getAllEvents(): Promise<Event[]> {
    return prisma.event.findMany();
  }

  public async getEventsByFacilityId(facilityId: string): Promise<Event[]> {
    return prisma.event.findMany({ where: { facilityId } });
  }

  public async getEventsByParkId(parkId: string): Promise<Event[]> {
    return prisma.event.findMany({
      where: {
        facility: {
          parkId: parseInt(parkId),
        },
      },
      include: {
        facility: true,
      },
    });
  }

  public async getEventCountByParkId(parkId: string): Promise<number> {
    return prisma.event.count({
      where: {
        facility: {
          parkId: parseInt(parkId),
        },
      },
    });
  }

  public async getEventById(id: string): Promise<Event | null> {
    return prisma.event.findUnique({ where: { id } });
  }

  public async updateEventDetails(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
    return prisma.event.update({ where: { id }, data });
  }

  public async updateEventStatus(id: string, status: EventStatusEnum): Promise<Event> {
    return prisma.event.update({ where: { id }, data: { status } });
  }

  public async deleteEvent(id: string): Promise<void> {
    await prisma.event.delete({ where: { id } });
  }

  public async getEventByTitleAndFacilityId(title: string, facilityId: string): Promise<Event | null> {
    return prisma.event.findFirst({ where: { title, facilityId } });
  }

  public async createEventTicketListing(data: Prisma.EventTicketListingCreateInput): Promise<EventTicketListing> {
    return prisma.eventTicketListing.create({ data });
  }

  public async getAllEventTicketListings(): Promise<EventTicketListing[]> {
    return prisma.eventTicketListing.findMany();
  }

  public async getEventTicketListingsByEventId(eventId: string): Promise<EventTicketListing[]> {
    return prisma.eventTicketListing.findMany({ where: { eventId } });
  }

  public async getEventTicketListingById(id: string): Promise<EventTicketListing | null> {
    return prisma.eventTicketListing.findUnique({ where: { id } });
  }

  public async updateEventTicketListingDetails(id: string, data: Prisma.EventTicketListingUpdateInput): Promise<EventTicketListing> {
    return prisma.eventTicketListing.update({ where: { id }, data });
  }

  public async deleteEventTicketListing(id: string): Promise<void> {
    await prisma.eventTicketListing.delete({ where: { id } });
  }
}

export default new EventDao();
