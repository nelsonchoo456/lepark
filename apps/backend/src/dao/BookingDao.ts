import { PrismaClient, Booking, Prisma, BookingStatusEnum } from '@prisma/client';

const prisma = new PrismaClient();

class BookingDao {
  async createBooking(data: Prisma.BookingCreateInput): Promise<Booking> {
    return prisma.booking.create({
      data,
      include: {
        facility: true,
        visitor: true,
      },
    });
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        facility: true,
        visitor: true,
      },
    });
  }

  async getAllBookings(): Promise<Booking[]> {
    return prisma.booking.findMany({
      include: {
        facility: true,
        visitor: true,
      },
    });
  }

  async updateBookingStatus(id: string, status: BookingStatusEnum): Promise<Booking> {
    return prisma.booking.update({
      where: { id },
      data: { bookingStatus: status },
      include: {
        facility: true,
        visitor: true,
      },
    });
  }

  async deleteBooking(id: string): Promise<Booking> {
    return prisma.booking.delete({
      where: { id },
      include: {
        facility: true,
        visitor: true,
      },
    });
  }

  async getBookingsByVisitorId(visitorId: string): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { visitorId },
      include: {
        facility: true,
        visitor: true,
      },
    });
  }

  async getBookingsByFacilityId(facilityId: string): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { facilityId },
      include: {
        facility: true,
        visitor: true,
      },
    });
  }
}

export default new BookingDao();