import { Booking, BookingStatusEnum, Facility, Visitor } from '@prisma/client';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import BookingDao from '../dao/BookingDao';
import FacilityDao from '../dao/FacilityDao';
import VisitorDao from '../dao/VisitorDao';
import { BookingSchema, BookingSchemaType } from '../schemas/bookingSchema';
import EmailUtil from '../utils/EmailUtil';

class BookingService {
  public async createBooking(data: BookingSchemaType): Promise<Booking> {
    try {
      // Validate facility exists and is bookable
      const facility = await FacilityDao.getFacilityById(data.facilityId);
      if (!facility) {
        throw new Error('Facility not found');
      }
      if (!facility.isBookable) {
        throw new Error('Facility is not available for booking');
      }

      // Validate visitor exists
      const visitor = await VisitorDao.getVisitorById(data.visitorId);
      if (!visitor) {
        throw new Error('Visitor not found');
      }

      const formattedData = dateFormatter(data);
      BookingSchema.parse(formattedData);

      const result = await BookingDao.createBooking(formattedData);

      // Send confirmation email
      //   await EmailUtil.sendBookingConfirmationEmail(visitor.email, result);

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getBookingById(id: string): Promise<Booking & { facility: Facility; visitor: Visitor }> {
    const booking = await BookingDao.getBookingById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const facility = await FacilityDao.getFacilityById(booking.facilityId);
    if (!facility) {
      throw new Error('Facility not found');
    }

    const visitor = await VisitorDao.getVisitorById(booking.visitorId);
    if (!visitor) {
      throw new Error('Visitor not found');
    }
    return { ...booking, facility, visitor };
  }

  public async getAllBookings(): Promise<Booking[]> {
    return BookingDao.getAllBookings();
  }

  public async updateBookingStatus(id: string, status: BookingStatusEnum): Promise<Booking> {
    const booking = await BookingDao.getBookingById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }
    return BookingDao.updateBookingStatus(id, status);
  }

  public async deleteBooking(id: string): Promise<void> {
    const booking = await BookingDao.getBookingById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }
    await BookingDao.deleteBooking(id);
  }

  public async getBookingsByVisitorId(visitorId: string): Promise<Booking[]> {
    const visitor = await VisitorDao.getVisitorById(visitorId);
    if (!visitor) {
      throw new Error('Visitor not found');
    }
    return BookingDao.getBookingsByVisitorId(visitorId);
  }

  public async getBookingsByFacilityId(facilityId: string): Promise<Booking[]> {
    const facility = await FacilityDao.getFacilityById(facilityId);
    if (!facility) {
      throw new Error('Facility not found');
    }
    return BookingDao.getBookingsByFacilityId(facilityId);
  }
}

const dateFormatter = (data: any) => {
  const { dateStart, dateEnd, dateBooked, paymentDeadline, ...rest } = data;
  const formattedData = { ...rest };

  if (dateStart) formattedData.dateStart = new Date(dateStart);
  if (dateEnd) formattedData.dateEnd = new Date(dateEnd);
  if (dateBooked) formattedData.dateBooked = new Date(dateBooked);
  if (paymentDeadline) formattedData.paymentDeadline = new Date(paymentDeadline);

  return formattedData;
};

export default new BookingService();