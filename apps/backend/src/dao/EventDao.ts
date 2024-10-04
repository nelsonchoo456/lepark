import { PrismaClient, Prisma, Event, EventStatusEnum } from '@prisma/client';

const prisma = new PrismaClient();

class EventDao {
  async createEvent(data: Prisma.EventCreateInput): Promise<Event> {
    return prisma.event.create({ data });
  }

  async getAllEvents(): Promise<Event[]> {
    return prisma.event.findMany();
  }

  async getEventsByFacilityId(facilityId: string): Promise<Event[]> {
    return prisma.event.findMany({ where: { facilityId } });
  }

  async getEventsByParkId(parkId: string): Promise<Event[]> {
    return prisma.event.findMany({
      where: {
        facility: {
          parkId: parseInt(parkId)
        }
      },
      include: {
        facility: true
      }
    });
  }

  async getEventCountByParkId(parkId: string): Promise<number> {
    return prisma.event.count({
      where: {
        facility: {
          parkId: parseInt(parkId)
        }
      }
    });
  }

  async getEventById(id: string): Promise<Event | null> {
    return prisma.event.findUnique({ where: { id } });
  }

  async updateEventDetails(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
    return prisma.event.update({ where: { id }, data });
  }

  async updateEventStatus(id: string, status: EventStatusEnum): Promise<Event> {
    return prisma.event.update({ where: { id }, data: { status } });
  }

  async deleteEvent(id: string): Promise<void> {

    await prisma.event.delete({ where: { id } });
  }

  async getEventByTitleAndFacilityId(title: string, facilityId: string): Promise<Event | null> {
    return prisma.event.findFirst({ where: { title, facilityId } });
  }
}

export default new EventDao();