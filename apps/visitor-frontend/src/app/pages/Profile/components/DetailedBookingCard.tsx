import React from 'react';
import { BookingResponse, BookingStatusEnum } from '@lepark/data-access';
import dayjs from 'dayjs';
import { Tag } from 'antd';

interface DetailedBookingCardProps {
  booking: BookingResponse;
  onClick: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'green';
    case 'PENDING':
      return 'gold';
    case 'APPROVED_PENDING_PAYMENT':
      return 'gold';
    case 'CANCELLED':
      return 'red';
    case 'REJECTED':
      return 'red';
    default:
      return 'default';
  }
};

const formatBookingStatus = (status: BookingStatusEnum): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'CANCELLED':
      return 'Cancelled';
    case 'REJECTED':
      return 'Rejected';
    case 'APPROVED_PENDING_PAYMENT':
      return 'Approved (Pending Payment)';
    case 'CONFIRMED':
      return 'Confirmed';
    default:
      return status;
  }
};

const DetailedBookingCard: React.FC<DetailedBookingCardProps> = ({ booking, onClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-md mb-4 cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={onClick}>
      <img src={booking?.facility?.images?.[0]} alt={booking?.facility?.name} className="w-full h-48 object-cover rounded-t-lg" />
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <h4 className="ml-2text-xl font-bold m-0">{booking.facility?.name}</h4>
          <Tag color={getStatusColor(booking.bookingStatus)}>{formatBookingStatus(booking.bookingStatus)}</Tag>
        </div>
        <p className="font-semibold">
          {dayjs(booking.dateStart).format('MMMM D, YYYY')} - {dayjs(booking.dateEnd).format('MMMM D, YYYY')}
        </p>
        <p>Purpose: {booking.bookingPurpose}</p>
        <p>Number of people: {booking.pax}</p>
      </div>
    </div>
  );
};

export default DetailedBookingCard;
