import { PrismaClient, Booking, Prisma, BookingStatusEnum } from '@prisma/client';

const prisma = new PrismaClient();

class BookingDao {
  public async createBooking(
    data: Prisma.BookingCreateInput
  ): Promise<Booking> {
    return prisma.booking.create({
      data,
      include: {
        facility: true,
        visitor: true,
      },
    });
  }

  public async getBookingById(
    id: string
  ): Promise<Booking | null> {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        facility: true,
        visitor: true,
      },
    });
  }

  public async getAllBookings(): Promise<Booking[]> {
    return prisma.booking.findMany({
      include: {
        facility: true,
        visitor: true,
      },
    });
  }

  public async updateBookingStatus(
    id: string, 
    status: BookingStatusEnum
  ): Promise<Booking> {
    return prisma.booking.update({
      where: { id },
      data: { bookingStatus: status },
      include: {
        facility: true,
        visitor: true,
      },
    });
  }

  public async deleteBooking(
    id: string
  ): Promise<Booking> {
    return prisma.booking.delete({
      where: { id },
      include: {
        facility: true,
        visitor: true,
      },
    });
  }

  public async getBookingsByVisitorId(
    visitorId: string
  ): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { visitorId },
      include: {
        facility: true,
        visitor: true,
      },
    });
  }

  public async getBookingsByFacilityId(
    facilityId: string
  ): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { facilityId },
      include: {
        facility: true,
        visitor: true,
      },
    });
  }

  async updateBooking(id: string, data: Prisma.BookingUpdateInput): Promise<Booking> {
        try {
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data,
        include: {
          facility: true,
          visitor: true,
        },
      });
      return updatedBooking;
    } catch (error) {
      throw error;
    }
  }
}
export default new BookingDao();
